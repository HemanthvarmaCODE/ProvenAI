import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import ImageCompare from '../components/ImageCompare';
import * as api from '../api/client';
import toast from 'react-hot-toast';
import { EmbedResponse } from '../types';
import { 
  DocumentArrowDownIcon, 
  ClipboardDocumentIcon, 
  CheckIcon, 
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const EmbedPage = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ owner_name: '', ai_model: '', prompt_id: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [result, setResult] = useState<EmbedResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleEmbed = async () => {
    if (!file || !formData.owner_name) {
      toast.error('Please provide an image and owner name');
      return;
    }
    setIsProcessing(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('owner_name', formData.owner_name);
      data.append('ai_model', formData.ai_model || 'Unknown AI');
      data.append('prompt_id', formData.prompt_id || 'N/A');
      
      const res = await api.embedWatermark(data);
      setResult(res.data);
      setStep(3);
      toast.success('Watermark embedded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to embed watermark');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);
    try {
      const filename = 
        result.watermarked_filename || 
        result.watermarked_path?.replace(/\\/g, '/').split('/').pop() || 
        `wm_${result.image_uuid}.png`;
      await api.triggerDownload(filename);
      toast.success('Download started!');
    } catch (error: any) {
      toast.error('Download failed. Please check the backend connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.image_uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Image UUID copied to clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Embed Invisible Watermark</h1>
        <p className="text-slate-400">Secure your AI-generated image with invisible, cryptographically encrypted provenance.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-10 rounded-full" />
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 rounded-full transition-all duration-500" 
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} 
        />
        
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
              step >= s ? 'bg-indigo-500 border-slate-900 text-white' : 'bg-slate-800 border-slate-900 text-slate-500'
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-8">
            <h2 className="text-xl font-medium text-white mb-6">Step 1: Select AI Image</h2>
            <FileUpload onFileSelect={(f) => setFile(f)} label="Upload AI image (PNG, JPG, WEBP)" />
            <div className="mt-8 flex justify-end">
              <button 
                disabled={!file} 
                onClick={() => setStep(2)} 
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
              >
                Next: Enter Metadata &rarr;
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-8">
            <h2 className="text-xl font-medium text-white mb-6">Step 2: Provenance Metadata</h2>
            <p className="text-sm text-slate-400 mb-6">
              This data will be encrypted with <strong>AES-256-GCM</strong> and embedded invisibly into the image frequency coefficients.
            </p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Owner / Creator Name *</label>
                <input 
                  type="text" 
                  value={formData.owner_name} 
                  onChange={e => setFormData({...formData, owner_name: e.target.value})} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. John Doe, Studio AI, ArtStation Pro" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">AI Model Used *</label>
                <input 
                  type="text" 
                  value={formData.ai_model} 
                  onChange={e => setFormData({...formData, ai_model: e.target.value})} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. Midjourney v6, Stable Diffusion XL, DALL-E 3, Flux.1" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Prompt ID or Generation Hash (Optional)</label>
                <input 
                  type="text" 
                  value={formData.prompt_id} 
                  onChange={e => setFormData({...formData, prompt_id: e.target.value})} 
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" 
                  placeholder="e.g. MJ-9082-CYBERPUNK, SDXL-PROMPT-041" 
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setStep(1)} 
                className="px-6 py-2.5 border border-slate-700 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors"
              >
                &larr; Back
              </button>
              <button 
                onClick={handleEmbed} 
                disabled={!formData.owner_name || isProcessing} 
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Embedding DWT-SVD Watermark...
                  </>
                ) : (
                  'Embed Invisible Watermark'
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && result && (
          <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="glass-panel p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-white">Watermark Embedded Successfully</h2>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4" /> Protected & Encrypted
                </span>
              </div>
              
              <ImageCompare 
                originalSrc={file ? URL.createObjectURL(file) : ''} 
                modifiedSrc={result.watermarked_url || api.getImageUrl(result.watermarked_path || '')} 
              />
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
                  <p className="text-sm text-slate-400 mb-1">PSNR (Imperceptibility)</p>
                  <p className="text-2xl font-bold text-white">{result.psnr.toFixed(2)} dB</p>
                  <p className="text-xs text-emerald-400 mt-1">&gt; 38 dB (Invisible)</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
                  <p className="text-sm text-slate-400 mb-1">SSIM (Fidelity)</p>
                  <p className="text-2xl font-bold text-white">{result.ssim.toFixed(4)}</p>
                  <p className="text-xs text-emerald-400 mt-1">99%+ Structural Match</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5 text-center">
                  <p className="text-sm text-slate-400 mb-1">Embedding Time</p>
                  <p className="text-2xl font-bold text-white">{result.embedding_time.toFixed(2)}s</p>
                  <p className="text-xs text-slate-500 mt-1">Real-time processing</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-panel p-6">
                <h3 className="text-sm font-medium text-slate-400 mb-2">Image Provenance UUID</h3>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={result.image_uuid} 
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm" 
                  />
                  <button 
                    onClick={copyToClipboard} 
                    className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                    title="Copy UUID"
                  >
                    {copied ? <CheckIcon className="w-5 h-5" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Unique provenance identifier cryptographically embedded into the singular values.</p>
              </div>
              
              <div className="glass-panel p-6 flex flex-col justify-center">
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                >
                  {isDownloading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <DocumentArrowDownIcon className="w-6 h-6" />
                  )}
                  <span>Download Protected Image</span>
                </button>
                <p className="text-xs text-center text-slate-400 mt-2">Download this image and test it in the Verify or Attack pages!</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-panel p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-indigo-500/20 bg-indigo-500/5">
              <div>
                <h4 className="text-white font-medium">Ready to test verification?</h4>
                <p className="text-sm text-slate-400">Download the image above, then verify its authenticity or simulate attacks.</p>
              </div>
              <div className="flex gap-3">
                <Link 
                  to="/verify" 
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheckIcon className="w-4 h-4" /> Go to Verify Page &rarr;
                </Link>
                <Link 
                  to="/attack" 
                  className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-4 h-4" /> Attack Simulator
                </Link>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => { setStep(1); setFile(null); setResult(null); }} 
                className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
              >
                &larr; Embed another image
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmbedPage;
