import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const POSITIONS = ['Head Boy', 'Head Girl', 'Deputy Head Boy', 'Deputy Head Girl'];

export default function Results() {
  const [candidates, setCandidates] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: settingsData } = await supabase.from('settings').select('*').single();
    if (settingsData) setIsVisible(settingsData.results_visible);

    const { count } = await supabase.from('votes').select('*', { count: 'exact', head: true });
    setTotalVotes(count || 0);

    const { data: candData } = await supabase.from('candidates').select('*').order('vote_count', { ascending: false });
    if (candData) setCandidates(candData);
  };

  if (!isVisible) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-slate-800">Results are Currently Hidden</h2>
        <p className="text-slate-500 mt-2 max-w-md">The election dashboard is concealed. Administrators can release the results matrix from the Settings panel when the election concludes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Official Election Results</h2>
        <p className="text-slate-500 mt-1">Total Ballots Cast: <span className="font-bold text-slate-800">{totalVotes}</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {POSITIONS.map(position => {
          const positionCandidates = candidates.filter(c => c.position === position);
          if (positionCandidates.length === 0) return null;

          const winner = positionCandidates[0];
          const runnersUp = positionCandidates.slice(1);

          return (
            <div key={position} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-lg">{position}</h3>
              </div>
              
              <div className="p-6">
                {/* Winner Card */}
                <div className="flex items-center gap-4 bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 mb-6">
                  <div className="relative">
                    <img src={winner.photo_url || 'https://via.placeholder.com/150'} alt={winner.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">1</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-slate-800">{winner.name}</h4>
                    <p className="text-sm text-slate-500">Class {winner.class}</p>
                    <div className="mt-2 text-sm font-bold text-yellow-600 bg-yellow-100 inline-block px-3 py-1 rounded-full">
                      {winner.vote_count} Votes ({totalVotes > 0 ? ((winner.vote_count / totalVotes) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                </div>

                {/* Runners Up List */}
                <div className="space-y-4">
                  {runnersUp.map((candidate, index) => {
                    const percentage = totalVotes > 0 ? ((candidate.vote_count / totalVotes) * 100).toFixed(1) : 0;
                    return (
                      <div key={candidate.id}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span className="text-slate-700">{index + 2}. {candidate.name}</span>
                          <span className="text-slate-500">{candidate.vote_count} votes</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}