import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../components/Badge';
import { MagnifyingGlassIcon, DocumentArrowDownIcon, ShieldCheckIcon, BoltIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import * as api from '../api/client';
import toast from 'react-hot-toast';

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getHistory();
        if (res.data?.images) {
          setImages(res.data.images);
        }
      } catch (err) {
        toast.error('Could not load image history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownload = async (img: any) => {
    try {
      const filename = img.watermarked_path?.replace(/\\/g, '/').split('/').pop() || `wm_${img.image_uuid}.png`;
      await api.triggerDownload(filename);
      toast.success('Downloaded watermarked image');
    } catch {
      toast.error('Download failed');
    }
  };

  const filteredImages = images.filter(img => 
    img.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.owner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.ai_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    img.prompt_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Image Provenance History</h1>
          <p className="text-slate-400">View and download all your watermarked images and provenance credentials.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by file, owner, or AI model..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Image File</th>
                <th className="px-6 py-4 font-medium">Owner / Creator</th>
                <th className="px-6 py-4 font-medium">AI Model</th>
                <th className="px-6 py-4 font-medium">Date Protected</th>
                <th className="px-6 py-4 font-medium">PSNR / SSIM</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Loading protected images...
                  </td>
                </tr>
              ) : filteredImages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-base font-medium">No watermarked images found.</p>
                    <Link to="/embed" className="mt-2 inline-block text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
                      Embed your first AI image &rarr;
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredImages.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-indigo-400 font-mono">
                        PNG
                      </div>
                      <div>
                        <div>{item.original_filename}</div>
                        <div className="text-xs text-slate-500 font-mono truncate max-w-[150px]">
                          {item.image_uuid}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.owner_name}</td>
                    <td className="px-6 py-4 text-emerald-400 font-medium">{item.ai_model || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                      {item.psnr ? `${item.psnr.toFixed(1)} dB / ${item.ssim?.toFixed(3)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(item)}
                          className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Download watermarked image"
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" /> Download
                        </button>
                        <Link 
                          to="/verify"
                          className="p-1.5 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-300 rounded-lg transition-colors"
                          title="Verify in Authenticity Checker"
                        >
                          <ShieldCheckIcon className="w-4 h-4" />
                        </Link>
                        <Link 
                          to="/attack"
                          className="p-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 rounded-lg transition-colors"
                          title="Test in Attack Simulator"
                        >
                          <BoltIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
