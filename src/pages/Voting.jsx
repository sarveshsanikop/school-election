import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const STEPS = ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl', 'Review'];
const CLASSES = ['5', '6', '7', '8', '9', '10'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

export default function Voting() {
  // Application Mode: 'setup' (admin choosing class) or 'booth' (active voting)
  const [appMode, setAppMode] = useState('setup');
  
  // Setup States
  const [authType, setAuthType] = useState('student');
  const [classChoice, setClassChoice] = useState('');
  const [divChoice, setDivChoice] = useState('');
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);

  // Queue States
  const [voterQueue, setVoterQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [singleStaff, setSingleStaff] = useState(null);

  // Voting Booth States
  const [candidates, setCandidates] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState({});

  useEffect(() => {
    async function getCandidates() {
      const { data } = await supabase.from('candidates').select('*');
      if (data) setCandidates(data);
    }
    getCandidates();
  }, []);

  // -------------------------------------------------------------
  // START VOTING SESSIONS
  // -------------------------------------------------------------
  const startStudentQueue = async (e) => {
    e.preventDefault();
    setError('');
    if (!classChoice || !divChoice) return setError('Please select both Class and Division.');

    // Fetch ALL students in this class who haven't voted yet, sorted by Roll Number
    const { data, error: fetchErr } = await supabase.from('voters')
      .select('*')
      .eq('type', 'student')
      .eq('class', classChoice)
      .eq('division', divChoice)
      .eq('has_voted', false)
      .order('roll_no', { ascending: true });

    if (fetchErr) return setError('Database error. Please try again.');
    if (!data || data.length === 0) return setError(`All students in ${classChoice}-${divChoice} have already voted!`);

    setVoterQueue(data);
    setQueueIndex(0);
    setAppMode('booth');
  };

  const startStaffVoting = async (e) => {
    e.preventDefault();
    setError('');
    if (!staffId) return setError('Please enter a Staff ID.');

    const { data, error: fetchErr } = await supabase.from('voters')
      .select('*')
      .eq('type', 'staff')
      .eq('staff_no', staffId)
      .maybeSingle();

    if (fetchErr || !data) return setError('Staff ID not found.');
    if (data.has_voted) return setError('A vote has already been cast using this Staff ID.');

    setSingleStaff(data);
    setAppMode('booth');
  };

  // Determine who is currently holding the iPad
  const activeVoter = authType === 'student' ? voterQueue[queueIndex] : singleStaff;

  // -------------------------------------------------------------
  // VOTING LOGIC
  // -------------------------------------------------------------
  const currentPosition = STEPS[stepIndex];
  const positionCandidates = candidates.filter(c => c.position === currentPosition);

  const handleSelect = (candidateId) => {
    setSelections({ ...selections, [currentPosition]: candidateId });
  };

  const moveToNextVoter = () => {
    // Reset the ballot
    setStepIndex(0);
    setSelections({});

    if (authType === 'student') {
      if (queueIndex + 1 < voterQueue.length) {
        setQueueIndex(queueIndex + 1);
      } else {
        alert(`Class ${classChoice}-${divChoice} voting is complete! Returning to setup.`);
        resetToSetup();
      }
    } else {
      resetToSetup(); // Staff are one-at-a-time
    }
  };

  const handleSkipAbsent = () => {
    if (window.confirm(`Is ${activeVoter.name} absent? They will be skipped and can vote later.`)) {
      moveToNextVoter();
    }
  };

  const submitFinalVotes = async () => {
    // 1. Record the votes
    const { error: voteErr } = await supabase.from('votes').insert([{
      voter_id: activeVoter.id,
      head_boy: selections['Head Boy'],
      head_girl: selections['Head Girl'],
      deputy_head_boy: selections['Deputy Head Boy'],
      deputy_head_girl: selections['Deputy Head Girl'],
    }]);

    if (voteErr) return alert('Submission error. Please contact admin.');

    // 2. Increment candidate tallies
    for (const key of Object.keys(selections)) {
      const candidateId = selections[key];
      if (candidateId) {
        await supabase.rpc('increment_vote', { row_id: candidateId }); 
      }
    }

    // 3. Mark voter as completed
    await supabase.from('voters').update({ has_voted: true }).eq('id', activeVoter.id);

    // 4. Show success and move to next student in line
    alert('Vote securely recorded! Handing over to the next voter.');
    moveToNextVoter();
  };

  const resetToSetup = () => {
    setAppMode('setup');
    setVoterQueue([]);
    setSingleStaff(null);
    setClassChoice('');
    setDivChoice('');
    setStaffId('');
    setStepIndex(0);
    setSelections({});
  };


  // ============================================================================
  // VIEW 1: ADMIN SETUP (Selecting Class or Staff)
  // ============================================================================
  if (appMode === 'setup') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-10">
        <div className="bg-slate-900 p-8 text-center text-white">
          <h2 className="text-3xl font-black uppercase tracking-widest">Voting Booth Setup</h2>
          <p className="text-slate-400 mt-2 text-lg font-bold">Admin: Load a classroom roster or staff member</p>
        </div>

        <div className="flex border-b-2 border-slate-100">
          <button onClick={() => { setAuthType('student'); setError(''); }} className={`flex-1 py-5 text-xl font-bold transition-colors ${authType === 'student' ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}>Load Classroom</button>
          <button
  onClick={async () => {
    setAuthType('staff');
    setError('');

    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .eq('type', 'staff')
      .eq('has_voted', false)
      .order('staff_no', { ascending: true });

    if (!error) {
      setStaffList(data);
    }
  }}
  className={`flex-1 py-5 text-xl font-bold transition-colors ${
    authType === 'staff'
      ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600'
      : 'text-slate-500 hover:bg-slate-50'
  }`}
>
  Single Staff Login
</button>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-100 border-2 border-red-200 text-red-700 font-bold rounded-xl text-center">{error}</div>}

          {authType === 'student' ? (
            <form onSubmit={startStudentQueue} className="space-y-8">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">1. Select Class</label>
                <div className="flex gap-3 flex-wrap">
                  {CLASSES.map(cls => (
                    <button type="button" key={cls} onClick={() => setClassChoice(cls)} className={`flex-1 py-4 text-2xl font-black rounded-xl border-2 transition-colors ${classChoice === cls ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{cls}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">2. Select Division</label>
                <div className="flex gap-3">
                  {DIVISIONS.map(div => (
                    <button type="button" key={div} onClick={() => setDivChoice(div)} className={`flex-1 py-4 text-2xl font-black rounded-xl border-2 transition-colors ${divChoice === div ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>{div}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl text-2xl font-black shadow-lg uppercase tracking-wide transition-all">Start Continuous Voting</button>
            </form>
          ) : (
            <div className="space-y-4">
  <h3 className="text-2xl font-bold mb-4">
    Select Staff Member
  </h3>

  <div className="overflow-hidden rounded-xl border">
    <table className="w-full">
      <thead className="bg-slate-100">
        <tr>
          <th className="p-4 text-left">Staff ID</th>
          <th className="p-4 text-left">Name</th>
          <th className="p-4 text-center">Action</th>
        </tr>
      </thead>

      <tbody>
        {staffList.map((staff) => (
          <tr key={staff.id} className="border-t">
            <td className="p-4 font-bold">
              {staff.staff_no}
            </td>

            <td className="p-4">
              {staff.name}
            </td>

            <td className="p-4 text-center">
              <button
                onClick={() => {
                  setSingleStaff(staff);
                  setAppMode('booth');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
              >
                Vote
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {staffList.length === 0 && (
    <div className="text-center text-green-700 font-bold py-6">
      All staff members have already voted.
    </div>
  )}
</div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // CURRENT VOTER HEADER (Shows in booth at all times)
  // ============================================================================
  const VoterHeader = () => (
    <div className="flex justify-between items-center bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-200 shadow-sm">
      <div>
        <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Current Voter Identity</p>
        <p className="text-3xl font-black text-slate-900 uppercase">
          {activeVoter.name} 
          <span className="text-xl text-slate-500 ml-4 font-bold">
            ({authType === 'student' ? `Roll No: ${activeVoter.roll_no} | Class ${activeVoter.class}-${activeVoter.division}` : `Staff ID: ${activeVoter.staff_no}`})
          </span>
        </p>
      </div>
      
      {authType === 'student' && (
        <button 
          onClick={handleSkipAbsent} 
          className="bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300 px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm flex flex-col items-center"
        >
          <span>Mark Absent</span>
          <span className="text-xs text-red-400 uppercase tracking-widest mt-1">Skip to Next</span>
        </button>
      )}
    </div>
  );


  // ============================================================================
  // VIEW 2: REVIEW SUBMISSION PAGE
  // ============================================================================
  if (currentPosition === 'Review') {
    return (
      <div className="max-w-4xl mx-auto mt-6">
        <VoterHeader />
        
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-4xl font-black text-slate-900 mb-2 text-center uppercase tracking-wide">Review Your Ballot</h2>
          <p className="text-center text-xl text-slate-500 font-medium mb-10">Please confirm your selections before submitting.</p>
          
          <div className="divide-y-2 divide-slate-100 bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">
            {STEPS.slice(0, 4).map(pos => {
              const selectedCand = candidates.find(c => c.id === selections[pos]);
              return (
                <div key={pos} className="py-6 flex justify-between items-center px-4">
                  <span className="text-xl font-bold text-slate-500 uppercase">{pos}</span>
                  <span className="text-3xl font-black text-slate-900 uppercase">
                    {selectedCand ? selectedCand.name : <span className="text-red-500">NO SELECTION</span>}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-6 mt-10">
            <button onClick={() => setStepIndex(stepIndex - 1)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-6 rounded-2xl text-2xl font-bold transition-colors">Go Back</button>
            <button onClick={submitFinalVotes} className="flex-2 bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl text-2xl font-black shadow-lg uppercase tracking-wide transition-colors">CAST VOTE NOW</button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: LIVE SELECTION BALLOT
  // ============================================================================
  return (
    <div className="max-w-5xl mx-auto space-y-4 mt-6 pb-20">
      <VoterHeader />

      <div className="bg-slate-900 p-8 rounded-3xl shadow-md text-center text-white">
        <p className="text-lg font-bold text-blue-400 uppercase tracking-widest mb-2">Ballot Category {stepIndex + 1} of 4</p>
        <h2 className="text-5xl font-black uppercase tracking-wide">Select: {currentPosition}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-3">
        {positionCandidates.map((cand) => (
          <div 
            key={cand.id}
            onClick={() => handleSelect(cand.id)}
            className={`cursor-pointer bg-white p-4 rounded-2xl border-3 transition-all duration-200 text-center flex flex-col items-center ${
              selections[currentPosition] === cand.id 
                ? 'border-blue-600 bg-blue-50 scale-105 shadow-xl' 
                : 'border-slate-100 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <img src={cand.photo_url || 'https://via.placeholder.com/150'} alt={cand.name} className="w-38 h-38 rounded-full object-cover border-8 border-white shadow-md mb-6 bg-slate-100" />
            <h3 className="font-black text-slate-900 text-3xl mb-2">{cand.name}</h3>
            <p className="text-xl font-bold text-slate-500">Class {cand.class}</p>
            
            <div className={`mt-6 px-8 py-3 rounded-full text-lg font-bold uppercase tracking-wider w-full ${selections[currentPosition] === cand.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {selections[currentPosition] === cand.id ? 'Selected' : 'Tap to Select'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-8 border-t-2 border-slate-200 mt-10">
        <button disabled={stepIndex === 0} onClick={() => setStepIndex(stepIndex - 1)} className="px-10 py-5 rounded-2xl text-xl font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 disabled:opacity-30 transition-colors uppercase">
          Previous
        </button>
        <button onClick={() => setStepIndex(stepIndex + 1)} className="px-12 py-5 rounded-2xl text-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg uppercase transition-colors">
          Next Category
        </button>
      </div>
    </div>
  );
}