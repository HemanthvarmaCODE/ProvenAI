import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change?: string;
  variant?: 'indigo' | 'emerald' | 'rose' | 'amber';
  delay?: number;
}

const colorMap = {
  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const StatsCard = ({ title, value, icon: Icon, change, variant = 'indigo', delay = 0 }: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0;
      const end = value;
      if (start === end) return;
      const duration = 1000;
      const incrementTime = (duration / end) * 2;
      const timer = setInterval(() => {
        start += Math.ceil(end / 20);
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass-panel p-6 border ${colorMap[variant].split(' ')[2]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{displayValue}</h3>
          {change && (
            <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[variant].split(' ')[1]} ${colorMap[variant].split(' ')[0]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
