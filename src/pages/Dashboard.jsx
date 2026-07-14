import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { FiUsers, FiUserCheck, FiActivity, FiAward } from 'react-icons/fi';

const POSITIONS = ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl'];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    totalCandidates: 0,
    votesCast: 0,
    electionActive: false,
  });
  
  const [candidates, setCandidates] = useState([]);
  const [swipeIndex, setSwipeIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const { count: students } = await supabase.from('voters').select('*', { count: 'exact', head: true }).eq('type', 'student');
      const { count: staff } = await supabase.from('voters').select('*', { count: 'exact', head: true }).eq('type', 'staff');
      const { count: candCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
      const { count: votes } = await supabase.from('votes').select('*', { count: 'exact', head: true });
      const { data: config } = await supabase.from('settings').select('election_active').limit(1).maybeSingle();
      
      const { data: cands } = await supabase.from('candidates').select('*');

      setStats({
        totalStudents: students || 0,
        totalStaff: staff || 0,
        totalCandidates: candCount || 0,
        votesCast: votes || 0,
        electionActive: config?.election_active || false,
      });
      
      if (cands) setCandidates(cands);
    }
    fetchData();
  }, []);

  // 5-Second Auto-Swiper Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSwipeIndex((prev) => (prev + 1) % POSITIONS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const totalVoters = stats.totalStudents + stats.totalStaff;
  const turnout = totalVoters > 0 ? Math.round((stats.votesCast / totalVoters) * 100) : 0;
  
  const activePosition = POSITIONS[swipeIndex];
  const activeCandidates = candidates.filter(c => c.position === activePosition);

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Dashboard</h1>
          <p className="text-base text-slate-600 mt-1 font-bold">Real-time election overview</p>
        </div>
        <div className={`px-5 py-2.5 rounded-xl text-base font-black tracking-wide flex items-center gap-3 shadow-sm border-2 ${
          stats.electionActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
        }`}>
          <span className={`w-3 h-3 rounded-full ${stats.electionActive ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`}></span>
          {stats.electionActive ? 'ELECTION IS ACTIVE' : 'ELECTION IS CLOSED'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Voters" value={totalVoters} subtitle={`${stats.totalStudents} Students • ${stats.totalStaff} Staff`} icon={<FiUsers size={28} className="text-blue-700" />} bg="bg-blue-100" />
        <StatCard title="Registered Candidates" value={stats.totalCandidates} subtitle="Across 4 Positions" icon={<FiAward size={28} className="text-amber-700" />} bg="bg-amber-100" />
        <StatCard title="Total Votes Cast" value={stats.votesCast} subtitle={`${totalVoters - stats.votesCast} Remaining`} icon={<FiUserCheck size={28} className="text-emerald-700" />} bg="bg-emerald-100" />
        <StatCard title="Voter Turnout" value={`${turnout}%`} subtitle="Current participation rate" icon={<FiActivity size={28} className="text-purple-700" />} bg="bg-purple-100" />
      </div>

      {/* Auto-Swiping Candidate Showcase - PASTEL BLUE BACKGROUND */}
      <div className="bg-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden">
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h2 className="text-xl font-bold text-blue-900 tracking-wide">Candidate Showcase</h2>
          <span className="bg-white text-blue-800 border border-blue-200 px-5 py-2 rounded-full font-bold text-base tracking-widest uppercase shadow-sm transition-all duration-300">
            {activePosition}
          </span>
        </div>
        
        <div className="relative z-10 min-h-[320px]">
          {activeCandidates.length === 0 ? (
            <div className="flex items-center justify-center h-full text-blue-400 text-lg font-semibold py-20">
              No candidates registered for {activePosition} yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 items-center justify-center transition-all duration-500 ease-in-out">
              {activeCandidates.map(candidate => (
                <div key={candidate.id} className="bg-white p-4 rounded-2xl shadow-md flex flex-col items-center justify-center w-[220px] transform hover:scale-105 transition-transform border border-blue-50">
                  {/* Large Square Image inside White Card */}
                  <img 
                    src={candidate.photo_url} 
                    alt={candidate.name} 
                    className="w-full h-44 rounded-xl object-cover shadow-sm mb-4 bg-slate-50 border border-slate-100" 
                  />
                  <h3 className="text-xl font-black text-slate-900 text-center w-full truncate pb-1">{candidate.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Progress indicators for the swiper */}
        <div className="flex justify-center gap-3 mt-8 relative z-10">
          {POSITIONS.map((pos, idx) => (
            <div key={pos} className={`h-2 rounded-full transition-all duration-500 ${idx === swipeIndex ? 'w-10 bg-blue-600' : 'w-3 bg-blue-200'}`}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, bg }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${bg} opacity-60 group-hover:scale-110 transition-transform duration-500`}></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm text-slate-700 font-extrabold uppercase tracking-widest">{title}</p>
          <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
        </div>
        <p className="text-3xl font-black text-slate-900 mb-2">{value}</p>
        <p className="text-sm font-bold text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}