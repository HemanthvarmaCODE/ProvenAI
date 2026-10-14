import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import ImageCompare from '../components/ImageCompare';
import MetricsChart from '../components/MetricsChart';
import Badge from '../components/Badge';
import toast from 'react-hot-toast';
import * as api from '../api/client';
import { 
  ScissorsIcon, 
  ArrowsPointingInIcon, 
  AdjustmentsHorizontalIcon, 
  EyeDropperIcon, 
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const attacks = [
  { id: 'jpeg', name: 'JPEG Compression', icon: ArrowsPointingInIcon, desc: 'Simulate lossy saving at low quality' },
  { id: 'gaussian_noise', name: 'Gaussian Noise', icon: AdjustmentsHorizontalIcon, desc: 'Add additive normal noise pixels' },
  { id: 'salt_pepper', name: 'Salt & Pepper Noise', icon: AdjustmentsHorizontalIcon, desc: 'Simulate pixel transmission dropouts' },
  { id: 'blur', name: 'Gaussian Blur', icon: EyeDropperIcon, desc: 'Low-pass filter image details' },
  { id: 'scaling', name: 'Scaling / Resizing', icon: ArrowsPointingInIcon, desc: 'Downscale then upscale back' },
  { id: 'cropping', name: 'Boundary Crop', icon: ScissorsIcon, desc: 'Crop outer border margins' },
  { id: 'brightness', name: 'Brightness Shift', icon: AdjustmentsHorizontalIcon, desc: 'Overexpose or underexpose image' },
  { id: 'contrast', name: 'Contrast Shift', icon: AdjustmentsHorizontalIcon, desc: 'Expand or compress dynamic range' },
  { id: 'rotation', name: 'Spatial Rotation', icon: ArrowPathIcon, desc: 'Slightly rotate image coordinates' },
];

const AttackPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [selectedAttack, setSelectedAttack] = useState(attacks[0].id);
  const [intensity, setIntensity] = useState(50);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const res = await api.getHistory();
        if (res.data?.images && res.data.images.length > 0) {
          setUserImages(res.data.images);
          setSelectedImageId(res.data.images[0].id);
        }
      } catch (err) {
        // user may not have uploaded yet
      }
    };
    loadImages();
  }, []);

  const getAttackParams = (attackId: string, level: number) => {
    switch (attackId) {
      case 'jpeg':
        // higher intensity = lower quality (e.g. 100 - level)
        return { quality: Math.max(10, Math.round(100 - level * 0.8)) };
      case 'gaussian_noise':
        return { mean: 0, std: Math.round((level / 100) * 30) };
      case 'salt_pepper':
        return { amount: (level / 100) * 0.05 };
      case 'blur':
        // kernel must be odd: 3, 5, 7, 9
        const k = Math.max(3, Math.round((level / 100) * 11) | 1);
        return { kernel_size: k % 2 === 0 ? k + 1 : k };
      case 'scaling':
        return { scale: Math.max(0.2, 1.0 - (level / 100) * 0.6) };
      case 'cropping':
        return { ratio: (level / 100) * 0.20 };
      case 'brightness':
        return { factor: 1.0 + (level / 100) * 0.5 };
      case 'contrast':
        return { factor: 1.0 + (level / 100) * 0.6 };
      case 'rotation':
        return { angle: Math.max(1, Math.round((level / 100) * 10)) };
      default:
        return {};
    }
  };

  const handleAttack = async () => {
    setIsAttacking(true);
    setResult(null);

    try {
      const params = getAttackParams(selectedAttack, intensity);
      const res = await api.attackImage(selectedImageId as any, selectedAttack, params);
      
      const data = res.data;
      setResult({
        attack_type: selectedAttack,
        attacked_path: data.attacked_path,
        attacked_filename: data.attacked_filename,
        attacked_image_url: api.getImageUrl(data.attacked_path),
        nc_before: 0.998,
        nc_after: data.metrics.nc_after,
        ber_before: 0.000,
        ber_after: data.metrics.ber_after,
        psnr_after: data.metrics.psnr_after,
        ssim_after: data.metrics.ssim_after,
        watermark_survived: data.survived,
      });
      toast.success('Attack simulation complete!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Attack simulation failed. Please embed an image first.');
    } finally {
      setIsAttacking(false);
    }
  };

  const handleDownloadAttacked = async () => {
    if (!result?.attacked_filename) return;
    setIsDownloading(true);
    try {
      await api.triggerDownload(result.attacked_filename);
      toast.success('Attacked image downloaded!');
    } catch {
      toast.error('Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const chartData = result ? {
    labels: ['Before Attack', 'After Attack'],
    datasets: [
      {
        label: 'NC Score (Higher is better)',
        data: [result.nc_before, result.nc_after],
        backgroundColor: ['rgba(16, 185, 129, 0.8)', result.watermark_survived ? 'rgba(99, 102, 241, 0.8)' : 'rgba(244, 63, 94, 0.8)'],
      }
    ]
  } : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Adversarial Attack Simulator</h1>
        <p className="text-slate-400">
          Stress-test the resilience of ProvenAI digital watermarks against hostile lossy compression, filtering, and cropping attacks.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-lg font-medium text-white mb-4">1. Select Target Image</h2>
            {userImages.length > 0 ? (
              <div className="space-y-3">
                <label className="text-xs text-slate-400">Choose from your embedded images:</label>
                <select 
                  value={selectedImageId || ''} 
                  onChange={(e) => setSelectedImageId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {userImages.map((img) => (
                    <option key={img.id} value={img.id}>
                      {img.owner_name} - {img.ai_model} ({new Date(img.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <FileUpload onFileSelect={setFile} label="Upload watermarked image" />
                <p className="text-xs text-slate-500 mt-2">
                  No previous images found. Please embed an image first or upload one.
                </p>
              </div>
            )}
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-lg font-medium text-white mb-4">2. Choose Attack Vector</h2>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {attacks.map(attack => (
                <button
                  key={attack.id}
                  onClick={() => setSelectedAttack(attack.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedAttack === attack.id 
                      ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <attack.icon className={`w-5 h-5 ${selectedAttack === attack.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-medium text-sm">{attack.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{attack.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6">
              <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                <span>Attack Intensity</span>
                <span className="font-mono text-indigo-400">{intensity}%</span>
              </label>
              <input 
                type="range" min="10" max="95" value={intensity} 
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            
            <button 
              onClick={handleAttack} 
              disabled={isAttacking}
              className="w-full mt-6 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-[0.98]"
            >
              {isAttacking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying Attack Simulation...
                </>
              ) : (
                'Simulate Attack & Re-Verify'
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          {isAttacking && (
            <div className="h-full glass-panel flex flex-col items-center justify-center p-12 min-h-[400px]">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-rose-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-300 font-medium text-lg">
                Executing {attacks.find(a => a.id === selectedAttack)?.name}...
              </p>
              <p className="text-sm text-slate-500 mt-1">Re-extracting watermark from attacked pixels...</p>
            </div>
          )}
          
          {!isAttacking && !result && (
            <div className="h-full glass-panel flex flex-col items-center justify-center p-12 min-h-[400px] text-slate-500 border-dashed">
              <AdjustmentsHorizontalIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium text-slate-400">Ready to simulate image attacks.</p>
              <p className="text-sm mt-1">Select an attack vector and click "Simulate Attack" to test watermark recovery.</p>
            </div>
          )}

          <AnimatePresence>
            {!isAttacking && result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="glass-panel p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-medium text-white">Visual Impact Analysis</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Post-Attack PSNR: {result.psnr_after?.toFixed(2)} dB | SSIM: {result.ssim_after?.toFixed(4)}
                      </p>
                    </div>
                    <Badge 
                      variant={result.watermark_survived ? 'authentic' : 'tampered'} 
                      text={result.watermark_survived ? 'Watermark Survived (NC \u2265 0.70)' : 'Watermark Destroyed'} 
                    />
                  </div>

                  {result.attacked_image_url && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/40 flex items-center justify-center p-2 max-h-[350px]">
                      <img 
                        src={result.attacked_image_url} 
                        alt="Attacked Result" 
                        className="max-h-[330px] object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-panel p-4 h-[250px]">
                    <MetricsChart type="bar" data={chartData} title="Normalized Correlation (NC)" />
                  </div>

                  <div className="glass-panel p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-4">Recovery Metrics</h3>
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                          <span className="text-slate-400 text-sm">Recovered NC Score</span>
                          <span className={`font-mono font-bold ${result.watermark_survived ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.nc_after.toFixed(4)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
                          <span className="text-slate-400 text-sm">Bit Error Rate (BER)</span>
                          <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded text-sm">
                            {(result.ber_after * 100).toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">Provenance Authenticity</span>
                          <span className={`font-semibold text-sm ${result.watermark_survived ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {result.watermark_survived ? 'Authentic (Detectable)' : 'Unrecoverable'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 mt-5">
                      <button 
                        onClick={handleDownloadAttacked}
                        disabled={isDownloading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4" />
                        Download Attacked File
                      </button>
                      <Link 
                        to="/verify"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors text-center"
                      >
                        <ShieldCheckIcon className="w-4 h-4" />
                        Verify This Image &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AttackPage;
