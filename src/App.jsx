import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddVoters from './pages/AddVoters';
import ViewVoters from './pages/ViewVoters';
import Candidates from './pages/Candidates';
import Voting from './pages/Voting';
import Results from './pages/Results';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Layout Protected App Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-[#F8FAFC]">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/add-voters" element={<AddVoters />} />
                    <Route path="/view-voters" element={<ViewVoters />} />
                    <Route path="/candidates" element={<Candidates />} />
                    <Route path="/voting" element={<Voting />} />
                    <Route path="/results" element={<Results />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;