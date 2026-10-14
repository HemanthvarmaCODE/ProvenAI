import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  PhotoIcon, 
  ShieldCheckIcon, 
  BoltIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CogIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) => {
  const { user } = useAuth();

  const links = [
    { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
    { name: 'Embed Watermark', to: '/embed', icon: PhotoIcon },
    { name: 'Verify Image', to: '/verify', icon: ShieldCheckIcon },
    { name: 'Attack Simulator', to: '/attack', icon: BoltIcon },
    { name: 'Statistics', to: '/statistics', icon: ChartBarIcon },
    { name: 'History', to: '/history', icon: ClockIcon },
  ];

  if (user?.is_admin) {
    links.push({ name: 'Admin', to: '/admin', icon: CogIcon });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="glass-panel m-2 mr-0 overflow-hidden flex flex-col shrink-0"
        >
          <div className="flex-1 py-6 flex flex-col gap-2 px-4">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <link.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium whitespace-nowrap">{link.name}</span>
              </NavLink>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
