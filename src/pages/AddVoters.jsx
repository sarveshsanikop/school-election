import React, { useState } from 'react';
import { supabase } from '../services/supabase';

const CLASSES = ['5', '6', '7', '8', '9', '10'];
const DIVISIONS = ['A', 'B', 'C', 'D'];

export default function AddVoters() {
  const [activeTab, setActiveTab] = useState('student');
  const [studentForm, setStudentForm] = useState({ name: '', class: '', division: '', rollNo: '' });
  const [staffForm, setStaffForm] = useState({ name: '', staffNo: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if(!studentForm.class || !studentForm.division) {
      setMessage({ type: 'danger', text: 'Please select a Class and Division.'});
      return;
    }

    const { error } = await supabase.from('voters').insert([{
      type: 'student',
      name: studentForm.name,
      class: studentForm.class,
      division: studentForm.division,
      roll_no: parseInt(studentForm.rollNo)
    }]);

    if (error) setMessage({ type: 'danger', text: error.message });
    else {
      setMessage({ type: 'success', text: `Student ${studentForm.name} registered successfully.` });
      setStudentForm({ name: '', class: '', division: '', rollNo: '' });
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('voters').insert([{
      type: 'staff',
      name: staffForm.name,
      staff_no: staffForm.staffNo
    }]);

    if (error) setMessage({ type: 'danger', text: error.message });
    else {
      setMessage({ type: 'success', text: `Staff ${staffForm.name} registered successfully.` });
      setStaffForm({ name: '', staffNo: '' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex border-b border-slate-100 bg-slate-50">
        <button
          onClick={() => { setActiveTab('student'); setMessage({ type: '', text: '' }); }}
          className={`flex-1 py-6 text-center font-extrabold text-xl transition-colors ${
            activeTab === 'student' ? 'border-b-4 border-[#2563EB] text-[#2563EB] bg-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Register Student Profile
        </button>
        <button
          onClick={() => { setActiveTab('staff'); setMessage({ type: '', text: '' }); }}
          className={`flex-1 py-6 text-center font-extrabold text-xl transition-colors ${
            activeTab === 'staff' ? 'border-b-4 border-[#2563EB] text-[#2563EB] bg-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Register Staff Profile
        </button>
      </div>

      <div className="p-8">
        {message.text && (
          <div className={`p-5 mb-6 rounded-2xl text-lg font-bold border-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {activeTab === 'student' ? (
          <form onSubmit={handleStudentSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Student Full Name</label>
              <input type="text" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full px-5 py-4 text-xl rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500" placeholder="Enter full name" />
            </div>
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Select Class</label>
              <div className="flex gap-3 flex-wrap">
                {CLASSES.map(cls => (
                  <button type="button" key={cls} onClick={() => setStudentForm({...studentForm, class: cls})} className={`flex-1 py-3 text-xl font-black rounded-xl border-2 transition-colors ${studentForm.class === cls ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Select Division</label>
                <div className="flex gap-3">
                  {DIVISIONS.map(div => (
                    <button type="button" key={div} onClick={() => setStudentForm({...studentForm, division: div})} className={`flex-1 py-3 text-xl font-black rounded-xl border-2 transition-colors ${studentForm.division === div ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                      {div}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Roll Number</label>
                <input type="number" required value={studentForm.rollNo} onChange={e => setStudentForm({...studentForm, rollNo: e.target.value})} className="w-full px-5 py-3 text-xl rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500" placeholder="e.g. 1" />
              </div>
            </div>

            <button type="submit" className="w-full mt-4 bg-[#2563EB] text-white py-5 rounded-2xl text-xl font-black shadow-md hover:bg-blue-700 transition-colors">
              Save Student Record
            </button>
          </form>
        ) : (
          <form onSubmit={handleStaffSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Staff Member Name</label>
              <input type="text" required value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full px-5 py-4 text-xl rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500" placeholder="Enter teacher name" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Unique Staff ID / Number</label>
              <input type="text" required value={staffForm.staffNo} onChange={e => setStaffForm({...staffForm, staffNo: e.target.value})} className="w-full px-5 py-4 text-xl rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-500" placeholder="e.g. TCH-01" />
            </div>
            <button type="submit" className="w-full mt-4 bg-[#2563EB] text-white py-5 rounded-2xl text-xl font-black shadow-md hover:bg-blue-700 transition-colors">
              Save Staff Record
            </button>
          </form>
        )}
      </div>
    </div>
  );
}