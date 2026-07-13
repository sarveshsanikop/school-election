import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export default function Settings() {
  const [settings, setSettings] = useState({ id: null, election_active: false, results_visible: false });

  useEffect(() => {
    async function loadSettings() {
      // Use maybeSingle to prevent crashes if the row doesn't exist yet
      const { data } = await supabase.from('settings').select('*').limit(1).maybeSingle();
      if (data) setSettings(data);
    }
    loadSettings();
  }, []);

  const toggleElection = async () => {
    const updatedValue = !settings.election_active;
    const { error } = await supabase.from('settings').update({ election_active: updatedValue }).eq('id', settings.id || 1);
    if (!error) setSettings(prev => ({ ...prev, election_active: updatedValue }));
  };

 const toggleResults = async () => {
  const password = window.prompt("Enter password to publish/hide results:");

  if (password === null) return;

  if (password !== "result") {
    alert("Incorrect password.");
    return;
  }

  const updatedValue = !settings.results_visible;

  const { error } = await supabase
    .from('settings')
    .update({ results_visible: updatedValue })
    .eq('id', settings.id || 1);

  if (!error) {
    setSettings(prev => ({
      ...prev,
      results_visible: updatedValue
    }));

    alert(updatedValue ? "Results published successfully." : "Results hidden successfully.");
  } else {
    alert("Failed to update results visibility.");
  }
};

const handleReset = async () => {
  const password = window.prompt("Enter password to reset election:");

  if (password === null) return;

  if (password !== "result") {
    alert("Incorrect password.");
    return;
  }

  const confirmAction = window.confirm(
    "WARNING!\n\nThis will permanently:\n\n• Delete all votes\n• Reset all voters\n• Reset all candidate vote counts\n\nDo you want to continue?"
  );

  if (!confirmAction) return;

  const { error: voteError } = await supabase
    .from('votes')
    .delete()
    .not('id', 'is', null);

  if (voteError) {
    alert("Failed to delete votes.");
    return;
  }

  const { error: voterError } = await supabase
    .from('voters')
    .update({ has_voted: false })
    .not('id', 'is', null);

  if (voterError) {
    alert("Failed to reset voters.");
    return;
  }

  const { error: candidateError } = await supabase
    .from('candidates')
    .update({ vote_count: 0 })
    .not('id', 'is', null);

  if (candidateError) {
    alert("Failed to reset candidate votes.");
    return;
  }

  alert("Election has been successfully reset.");
};


  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-sm border border-slate-100 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">System Settings</h2>
        <p className="text-lg text-slate-500 mt-2">Manage election state and visibility controls.</p>
      </div>
      
      <div className="flex justify-between items-center py-4 bg-slate-50 p-6 rounded-2xl">
        <div className="pr-8">
          <h4 className="text-xl font-bold text-slate-800 mb-1">Live Election Status</h4>
          <p className="text-base text-slate-500">Controls whether voters can currently cast their ballots in the Voting Booth.</p>
        </div>
        <button 
          onClick={toggleElection} 
          className={`shrink-0 px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-sm ${
            settings.election_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {settings.election_active ? 'Close Election' : 'Activate Election'}
        </button>
      </div>

      <div className="flex justify-between items-center py-4 bg-slate-50 p-6 rounded-2xl">
        <div className="pr-8">
          <h4 className="text-xl font-bold text-slate-800 mb-1">Results Dashboard Visibility</h4>
          <p className="text-base text-slate-500">Determines if the final results matrix is visible on the Results page.</p>
        </div>
        <button 
          onClick={toggleResults} 
          className={`shrink-0 px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-sm ${
            settings.results_visible ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {settings.results_visible ? 'Hide Results' : 'Publish Results'}
        </button>
      </div>

      <div className="pt-8 border-t border-slate-200">
        <button 
          onClick={handleReset}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-5 rounded-2xl shadow-md transition-colors text-xl tracking-wide"
        >
          HARD RESET ELECTION DATA
        </button>
      </div>
    </div>
  );
}