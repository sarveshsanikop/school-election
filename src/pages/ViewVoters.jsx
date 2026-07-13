import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FiSearch, FiTrash2, FiAlertCircle, FiUsers, FiBriefcase } from 'react-icons/fi';

const CLASSES = ['5', '6', '7', '8', '9', '10'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

export default function ViewVoters() {
  const [voters, setVoters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drill-down filter states
  const [viewType, setViewType] = useState('student');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDiv, setSelectedDiv] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('voters').select('*');
    if (error) console.error("Error fetching voters:", error);
    if (data) setVoters(data);
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this voter completely?')) {
      await supabase.from('voters').delete().eq('id', id);
      fetchVoters();
    }
  };

  const showStudentTable = viewType === 'student' && selectedClass !== '' && selectedDiv !== '';
  const showStaffTable = viewType === 'staff';
  const shouldShowTable = showStudentTable || showStaffTable;

  const filteredVoters = voters.filter(v => {
    // 1. Match Type (Safeguard for exact casing)
    if ((v.type || '').toLowerCase() !== viewType) return false;

    // 2. Match Class & Div (Forgiving match: ignores spaces and case differences from old text inputs)
    if (viewType === 'student') {
      const dbClass = (v.class || '').toString().trim().toLowerCase();
      const btnClass = selectedClass.toLowerCase();
      const dbDiv = (v.division || '').toString().trim().toLowerCase();
      const btnDiv = selectedDiv.toLowerCase();

      if (dbClass !== btnClass) return false;
      if (dbDiv !== btnDiv) return false;
    }

    // 3. Match Search
    if (search) {
      const query = search.toLowerCase().trim();
      const matchesName = (v.name || '').toLowerCase().includes(query);
      const matchesRoll = v.roll_no && v.roll_no.toString().includes(query);
      const matchesStaffNo = (v.staff_no || '').toLowerCase().includes(query);
      if (!matchesName && !matchesRoll && !matchesStaffNo) return false;
    }

    return true;
  });

  // Sort students sequentially
  if (viewType === 'student') {
    filteredVoters.sort((a, b) => (a.roll_no || 0) - (b.roll_no || 0));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[70vh] flex flex-col">
      
      {/* Top Toggle */}
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button
          onClick={() => { setViewType('student'); setSearch(''); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-lg font-bold transition-colors ${
            viewType === 'student' ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FiUsers size={20} /> Manage Students
        </button>
        <button
          onClick={() => { setViewType('staff'); setSearch(''); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-lg font-bold transition-colors ${
            viewType === 'staff' ? 'border-b-2 border-blue-600 text-blue-700 bg-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <FiBriefcase size={20} /> Manage Staff
        </button>
      </div>

      {/* Drill-down filters */}
      {viewType === 'student' && (
        <div className="p-6 border-b border-slate-100 bg-white space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">1. Select Class</h3>
            <div className="flex gap-3 flex-wrap">
              {CLASSES.map(cls => (
                <button 
                  key={cls} 
                  onClick={() => { setSelectedClass(cls); setSelectedDiv(''); }} 
                  className={`flex-1 py-2.5 text-lg font-bold rounded-xl border-2 transition-all ${
                    selectedClass === cls ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {selectedClass && (
            <div className="animate-fade-in-down">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">2. Select Division</h3>
              <div className="flex gap-3">
                {DIVISIONS.map(div => (
                  <button 
                    key={div} 
                    onClick={() => setSelectedDiv(div)} 
                    className={`flex-1 py-2.5 text-lg font-bold rounded-xl border-2 transition-all ${
                      selectedDiv === div ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {div}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Data Area */}
      <div className="flex-1 bg-slate-50 flex flex-col">
        {isLoading ? (
          <div className="p-16 text-center text-lg text-slate-500 font-medium">Loading records...</div>
        ) : !shouldShowTable ? (
          <div className="p-16 flex flex-col items-center justify-center text-center m-auto">
            <FiSearch size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-700">Awaiting Selection</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">Select a Class and Division above to load the student roster.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative max-w-2xl mx-auto">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder={viewType === 'student' ? `Search Class ${selectedClass}-${selectedDiv}...` : "Search Staff..."} 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50"
                />
              </div>
            </div>

            {filteredVoters.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center m-auto">
                <FiAlertCircle size={48} className="text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700">No Records Found</h2>
                <p className="text-sm text-slate-500 mt-2">No {viewType}s match this exact selection.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider border-y border-slate-200">
                      <th className="p-4 font-semibold w-20 text-center">{viewType === 'student' ? 'Roll No' : 'Staff ID'}</th>
                      <th className="p-4 font-semibold">Full Name</th>
                      <th className="p-4 font-semibold">Voting Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredVoters.map((voter) => (
                      <tr key={voter.id} className="hover:bg-blue-50 transition-colors">
                        <td className="p-4 font-bold text-slate-600 text-center bg-slate-50/50">
                          {viewType === 'student' ? voter.roll_no : voter.staff_no}
                        </td>
                        <td className="p-4 font-bold text-slate-800 capitalize">{voter.name}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${voter.has_voted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {voter.has_voted ? 'Voted' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(voter.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}