import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = ({ fullScreen = true, text = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { repeat: Infinity, duration: 2, ease: "linear" },
          scale: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 blur-sm"></div>
        <div className="w-16 h-16 rounded-full border-2 border-slate-700 border-t-indigo-500 flex items-center justify-center bg-slate-800">
          <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />
        </div>
      </motion.div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ yoyo: Infinity, duration: 0.8 }}
        className="text-slate-400 font-medium"
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="py-12 flex justify-center">{content}</div>;
};

export default LoadingSpinner;
