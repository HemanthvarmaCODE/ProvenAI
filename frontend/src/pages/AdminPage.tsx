import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import MetricsChart from '../components/MetricsChart';
import { UsersIcon, PhotoIcon, ServerIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const AdminPage = () => {
  const { user } = useAuth();

  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const userActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'API Requests', data: [1200, 1900, 1500, 2200, 1800, 900, 1100], borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: true }
    ]
  };

  const usersData = {
    labels: ['Free', 'Pro', 'Enterprise'],
    datasets: [{ data: [450, 120, 15], backgroundColor: ['#64748b', '#6366f1', '#8b5cf6'] }]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Control Panel</h1>
        <p className="text-slate-400">System-wide overview and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value="585" icon={UsersIcon} variant="indigo" />
        <StatsCard title="Total Embeddings" value="12,450" icon={PhotoIcon} variant="emerald" delay={0.1} />
        <StatsCard title="Tampering Detected" value="842" icon={ExclamationTriangleIcon} variant="rose" delay={0.2} />
        <StatsCard title="Server Load" value="42%" icon={ServerIcon} variant="amber" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-1">
          <MetricsChart type="line" data={userActivityData} title="System Activity (7 Days)" />
        </div>
        <div className="glass-panel p-1">
          <MetricsChart type="doughnut" data={usersData} title="User Tiers" />
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-medium text-white">Recent System Logs</h3>
        </div>
        <table className="w-full text-sm text-left text-slate-400">
          <tbody className="divide-y divide-white/5">
            <tr className="hover:bg-white/5">
              <td className="px-6 py-3 text-emerald-400 font-mono">[INFO]</td>
              <td className="px-6 py-3">Model weights updated successfully (v2.1)</td>
              <td className="px-6 py-3 text-right">10 mins ago</td>
            </tr>
            <tr className="hover:bg-white/5">
              <td className="px-6 py-3 text-amber-400 font-mono">[WARN]</td>
              <td className="px-6 py-3">High API latency detected in region US-East</td>
              <td className="px-6 py-3 text-right">1 hour ago</td>
            </tr>
            <tr className="hover:bg-white/5">
              <td className="px-6 py-3 text-emerald-400 font-mono">[INFO]</td>
              <td className="px-6 py-3">New user registration: admin_corp</td>
              <td className="px-6 py-3 text-right">3 hours ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
