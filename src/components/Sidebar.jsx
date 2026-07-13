import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiUserPlus, FiUsers, FiAward, FiCheckSquare, FiPieChart, FiSettings, FiLogOut } from 'react-icons/fi';

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <FiGrid size={24} /> },
  { path: '/add-voters', name: 'Add Voters', icon: <FiUserPlus size={24} /> },
  { path: '/view-voters', name: 'View Voters', icon: <FiUsers size={24} /> },
  { path: '/candidates', name: 'Candidates', icon: <FiAward size={24} /> },
  { path: '/voting', name: 'Voting Booth', icon: <FiCheckSquare size={24} /> },
  { path: '/results', name: 'Results', icon: <FiPieChart size={24} /> },
  { path: '/settings', name: 'Settings', icon: <FiSettings size={24} /> },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full justify-between shadow-sm z-20">
      <div>
        {/* Removed heavy padding and used w-full h-auto so the wide logo stretches to the edges */}
        <div className="px-1 py-6 border-b border-slate-100 flex items-center justify-center bg-white">
          <img src="/logo.png" alt="School Logo" className="w-full h-auto object-contain transform scale-105" />
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 font-bold ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'
                }`
              }
            >
              {item.icon}
              <span className="text-lg tracking-wide">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white py-4 rounded-xl transition-all duration-200 font-bold text-lg"
        >
          <FiLogOut size={24} /> Logout
        </button>
      </div>
    </div>
  );
}