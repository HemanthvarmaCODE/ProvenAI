import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import MetricsChart from '../components/MetricsChart';
import Badge from '../components/Badge';
import { DocumentDuplicateIcon, ShieldCheckIcon, ExclamationTriangleIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import * as api from '../api/client';
import { DashboardStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboard();
        setStats(res.data);
      } catch (error) {
        // Mock data for display if API fails
        setStats({
          total_images: 142,
          verified_images: 89,
          tampered_images: 12,
          success_rate: 94.5,
          recent_uploads: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <LoadingSpinner fullScreen={false} />;

  // Mock chart data
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Verifications',
        data: [65, 59, 80, 81, 56, 95],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const doughnutData = {
    labels: ['Authentic', 'Tampered', 'Unknown'],
    datasets: [
      {
        data: [stats?.verified_images || 0, stats?.tampered_images || 0, 41],
        backgroundColor: ['#10b981', '#f43f5e', '#64748b'],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.full_name}</h1>
        <p className="text-slate-400">Here's what's happening with your proven images today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Images" value={stats?.total_images || 0} icon={DocumentDuplicateIcon} variant="indigo" delay={0} />
        <StatsCard title="Verified" value={stats?.verified_images || 0} icon={ShieldCheckIcon} variant="emerald" delay={0.1} />
        <StatsCard title="Tampered" value={stats?.tampered_images || 0} icon={ExclamationTriangleIcon} variant="rose" delay={0.2} />
        <StatsCard title="Success Rate" value={`${stats?.success_rate || 0}%`} icon={ChartPieIcon} variant="amber" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-1"
        >
          <MetricsChart type="line" data={lineData} title="Activity Overview" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-panel p-1"
        >
          <MetricsChart type="doughnut" data={doughnutData} title="Status Breakdown" />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="glass-panel overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Model</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">project_render_final.png</td>
                  <td className="px-6 py-4 text-slate-400">Oct 24, 2023</td>
                  <td className="px-6 py-4 text-slate-300">Midjourney v5</td>
                  <td className="px-6 py-4"><Badge variant={i === 1 ? 'tampered' : 'authentic'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
