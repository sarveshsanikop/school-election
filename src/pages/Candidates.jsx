import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { FiTrash2 } from 'react-icons/fi';

const POSITIONS = ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl'];

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ name: '', class: '', position: 'Head Boy' });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    const { data } = await supabase.from('candidates').select('*');
    if (data) setCandidates(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a photo');
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      // FIXED: Pointing to the 'candidate' bucket
      const { error: uploadError } = await supabase.storage
        .from('candidate')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // FIXED: Pointing to the 'candidate' bucket
      const { data: { publicUrl } } = supabase.storage
        .from('candidate')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('candidates').insert([{
        name: formData.name,
        class: formData.class,
        position: formData.position,
        photo_url: publicUrl
      }]);

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setFormData({ name: '', class: '', position: 'Head Boy' });
      setFile(null);
      document.getElementById('file-upload').value = '';
      fetchCandidates();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      await supabase.from('candidates').delete().eq('id', id);
      fetchCandidates();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl">
        <h2 className="text-2xl font-extrabold text-slate-800 mb-6">Register New Candidate</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Candidate Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Class / Grade</label>
            <input required type="text" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Position</label>
            <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none bg-white">
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Photo Upload</label>
            <input id="file-upload" required type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="w-full px-5 py-3.5 text-base rounded-2xl border-2 border-slate-200 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700" />
          </div>
          <div className="md:col-span-2 pt-2">
            <button disabled={isUploading} type="submit" className="w-full bg-[#2563EB] text-white py-4 rounded-2xl text-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
              {isUploading ? 'Uploading Candidate Data...' : 'Register Candidate'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {candidates.map(candidate => (
          <div key={candidate.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative group">
            <button onClick={() => handleDelete(candidate.id)} className="absolute top-4 right-4 bg-red-50 text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors">
              <FiTrash2 size={20} />
            </button>
            <img src={candidate.photo_url} alt={candidate.name} className="w-40 h-40 rounded-full object-cover border-8 border-slate-50 shadow-sm mb-6" />
            <span className="text-sm font-black tracking-wider text-blue-700 bg-blue-100 px-4 py-2 rounded-full mb-4 uppercase">{candidate.position}</span>
            <h3 className="font-extrabold text-2xl text-slate-800 mb-1">{candidate.name}</h3>
            <p className="text-lg font-medium text-slate-500">Class {candidate.class}</p>
          </div>
        ))}
      </div>
    </div>
  );
}