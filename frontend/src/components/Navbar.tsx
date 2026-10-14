import React from 'react';
import { Bars3Icon, ShieldCheckIcon, UserCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  const { user, logout } = useAuth();

  return (
    <motion.header 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between z-10 m-2"
    >
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-slate-400 hover:text-white transition-colors">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-8 h-8 text-indigo-500" />
          <span className="text-xl font-bold text-gradient">ProvenAI</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-slate-800/50 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors w-64"
          />
        </div>
        
        <div className="relative group">
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <UserCircleIcon className="w-8 h-8 text-slate-300" />
            <span className="text-sm font-medium hidden md:block">{user?.username}</span>
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 hidden group-hover:block z-50">
            <div className="px-4 py-2 border-b border-slate-700">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <a href="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white">Profile</a>
            <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-slate-700 hover:text-rose-300">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
