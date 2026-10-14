import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MetricsChartProps {
  type: 'line' | 'bar' | 'radar' | 'doughnut';
  data: any;
  options?: any;
  title?: string;
}

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8' },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleColor: '#f8fafc',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#64748b' },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#64748b' },
    },
  },
};

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      grid: { color: 'rgba(255,255,255,0.1)' },
      angleLines: { color: 'rgba(255,255,255,0.1)' },
      pointLabels: { color: '#94a3b8' },
      ticks: { display: false, backdropColor: 'transparent' },
    },
  },
  plugins: {
    legend: { labels: { color: '#94a3b8' } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#94a3b8', padding: 20 } },
  },
  cutout: '75%',
};

const MetricsChart = ({ type, data, options, title }: MetricsChartProps) => {
  const chartOptions = type === 'radar' 
    ? { ...radarOptions, ...options } 
    : type === 'doughnut'
      ? { ...doughnutOptions, ...options }
      : { ...defaultOptions, ...options };

  return (
    <div className="glass-panel p-6 w-full h-full min-h-[300px] flex flex-col">
      {title && <h3 className="text-lg font-medium text-white mb-4">{title}</h3>}
      <div className="flex-1 relative">
        {type === 'line' && <Line data={data} options={chartOptions} />}
        {type === 'bar' && <Bar data={data} options={chartOptions} />}
        {type === 'radar' && <Radar data={data} options={chartOptions} />}
        {type === 'doughnut' && <Doughnut data={data} options={chartOptions} />}
      </div>
    </div>
  );
};

export default MetricsChart;
