import React from 'react';
import MetricsChart from '../components/MetricsChart';
import StatsCard from '../components/StatsCard';
import { ChartBarSquareIcon, BeakerIcon, ArrowsRightLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const StatisticsPage = () => {
  // Mock Data
  const psnrData = {
    labels: ['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6'],
    datasets: [{
      label: 'PSNR (dB)',
      data: [42.5, 41.2, 45.1, 39.8, 43.4, 44.2],
      backgroundColor: 'rgba(99, 102, 241, 0.7)',
    }]
  };

  const attackRobustnessData = {
    labels: ['Compression', 'Cropping', 'Noise', 'Blur', 'Rotation', 'Scaling'],
    datasets: [{
      label: 'Average NC Score',
      data: [0.95, 0.82, 0.88, 0.92, 0.75, 0.89],
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(139, 92, 246, 1)',
    }]
  };

  const berTrendData = {
    labels: ['10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%'],
    datasets: [{
      label: 'BER vs JPEG Compression Level',
      data: [0.01, 0.02, 0.03, 0.05, 0.08, 0.15, 0.25, 0.45],
      borderColor: '#f43f5e',
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">System Statistics</h1>
          <p className="text-slate-400">Aggregate metrics for watermarking performance and robustness.</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Average PSNR" value="42.7 dB" icon={ChartBarSquareIcon} variant="indigo" />
        <StatsCard title="Average SSIM" value="0.992" icon={ArrowsRightLeftIcon} variant="emerald" delay={0.1} />
        <StatsCard title="Average BER" value="3.4%" icon={BeakerIcon} variant="rose" delay={0.2} />
        <StatsCard title="Average NC" value="0.945" icon={ShieldCheckIcon} variant="amber" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-1">
          <MetricsChart type="bar" data={psnrData} title="PSNR Across Recent Embeddings" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-1">
          <MetricsChart type="radar" data={attackRobustnessData} title="Attack Robustness Profile" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="lg:col-span-2 glass-panel p-1">
          <MetricsChart type="line" data={berTrendData} title="Bit Error Rate Trend (Compression Attack)" />
        </motion.div>
      </div>
    </div>
  );
};

export default StatisticsPage;
