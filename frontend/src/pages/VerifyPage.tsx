import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import Badge from '../components/Badge';
import * as api from '../api/client';
import toast from 'react-hot-toast';
import { VerificationResult } from '../types';
import { 
  ShieldExclamationIcon, 
  CheckBadgeIcon, 
  ExclamationTriangleIcon, 
  QuestionMarkCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const VerifyPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!file) {
      toast.error('Please select an image to verify');
      return;
    }
    setIsVerifying(true);
    setResult(null);
    try {
      const res = await api.verifyImage(file);
      setResult(res.data);
      if (res.data.is_authentic) {
        toast.success('Provenance verified: Watermark detected!');
      } else {
        toast('No ProvenAI watermark found in this image.', { icon: 'ℹ️' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Verification request failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const confidencePercent = result ? Math.min(Math.max(result.confidence_score * 100, 0), 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Verify AI Image Provenance</h1>
        <p className="text-slate-400">
          Upload any image to verify whether it contains a ProvenAI invisible watermark and identify its originating AI model, owner, and prompt.
        </p>
      </div>

      <div className="glass-panel p-8">
        <FileUpload onFileSelect={(f) => setFile(f)} label="Upload image to verify (PNG, JPG, WEBP)" />
        <div className="mt-8 flex justify-center">
          <button 
            onClick={handleVerify} 
            disabled={!file || isVerifying}
            className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Extracting & Decrypting Watermark...
              </>
            ) : (
              <>
                <ShieldExclamationIcon className="w-6 h-6" />
                Verify Authenticity & Provenance
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Status Card */}
            <div className={`glass-panel p-8 border-2 ${
              !result.is_authentic 
                ? 'border-slate-700 bg-slate-900/60' 
                : result.is_tampered 
                  ? 'border-rose-500/50 bg-rose-950/10' 
                  : 'border-emerald-500/50 bg-emerald-950/10'
            } relative overflow-hidden flex flex-col justify-between`}>
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                {!result.is_authentic ? (
                  <QuestionMarkCircleIcon className="w-32 h-32 text-slate-500" />
                ) : result.is_tampered ? (
                  <ExclamationTriangleIcon className="w-32 h-32 text-rose-500" />
                ) : (
                  <CheckBadgeIcon className="w-32 h-32 text-emerald-500" />
                )}
              </div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <Badge 
                  variant={!result.is_authentic ? 'unknown' : result.is_tampered ? 'tampered' : 'authentic'} 
                  text={!result.is_authentic ? 'Unverified / No Watermark' : result.is_tampered ? 'Tampered / Modified' : 'Authentic AI Provenance'}
                  className="px-4 py-1.5 text-sm mb-4" 
                />
                
                <h2 className={`text-2xl font-bold mb-2 ${
                  !result.is_authentic 
                    ? 'text-slate-300' 
                    : result.is_tampered 
                      ? 'text-rose-400' 
                      : 'text-emerald-400'
                }`}>
                  {!result.is_authentic 
                    ? 'No Watermark Detected' 
                    : result.is_tampered 
                      ? 'Tampering / Attack Detected' 
                      : 'Image is Authentic'}
                </h2>

                {/* AI Model Highlight Badge if authentic */}
                {result.is_authentic && result.provenance?.model && (
                  <div className="mt-2 mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/20 border border-indigo-500/40 rounded-full text-indigo-300 text-sm font-semibold">
                    <SparklesIcon className="w-4 h-4 text-indigo-400" />
                    <span>AI Model: {result.provenance.model}</span>
                  </div>
                )}
                
                {/* Confidence Circle */}
                <div className="relative w-32 h-32 my-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="8" fill="none" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="56" 
                      className={
                        !result.is_authentic 
                          ? 'stroke-slate-600' 
                          : result.is_tampered 
                            ? 'stroke-rose-500' 
                            : 'stroke-emerald-500'
                      } 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="351" 
                      strokeDashoffset={351 - (351 * confidencePercent) / 100} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{confidencePercent.toFixed(0)}%</span>
                    <span className="text-xs text-slate-400">Match NC</span>
                  </div>
                </div>
                
                {result.is_tampered && (
                  <p className="text-sm text-rose-300/90 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 mt-2">
                    The watermark was recovered, but structural degradation indicates this image has undergone post-generation compression, filtering, or cropping.
                  </p>
                )}

                {!result.is_authentic && (
                  <p className="text-sm text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-700/40 mt-2">
                    This image was either not protected with ProvenAI or has been too severely distorted to extract a valid cryptographic signature.
                  </p>
                )}
              </div>
            </div>

            {/* Provenance Metadata Card */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center justify-between">
                  <span>Decrypted Provenance</span>
                  <span className="text-xs text-slate-400 font-mono">AES-256-GCM</span>
                </h3>
                
                {result.is_authentic ? (
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Owner / Creator</span>
                      <span className="text-white font-medium">{result.provenance?.owner || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">AI Model</span>
                      <span className="text-emerald-400 font-semibold">{result.provenance?.model || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Prompt ID</span>
                      <span className="text-white font-medium font-mono text-sm">{result.provenance?.prompt_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Image UUID</span>
                      <span className="text-white font-medium font-mono text-xs truncate max-w-[200px]" title={result.provenance?.image_uuid || ''}>
                        {result.provenance?.image_uuid || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Timestamp</span>
                      <span className="text-white font-medium text-sm">
                        {result.provenance?.timestamp ? new Date(result.provenance.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <QuestionMarkCircleIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No provenance metadata found.</p>
                    <p className="text-xs text-slate-600 mt-1">Watermark extraction correlation was below threshold (NC &lt; 0.70).</p>
                  </div>
                )}
              </div>
              
              <div className="glass-panel p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-400 mb-1">NC Correlation</p>
                  <p className={`text-xl font-bold ${result.is_authentic ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {result.nc_score.toFixed(4)}
                  </p>
                  <p className="text-[10px] text-slate-500">Threshold: &ge; 0.70</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-sm text-slate-400 mb-1">Bit Error Rate</p>
                  <p className="text-xl font-bold text-white">{result.ber_score.toFixed(2)}%</p>
                  <p className="text-[10px] text-slate-500">Target: &lt; 5%</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <p className={`text-sm font-semibold ${
                    !result.is_authentic ? 'text-slate-400' : result.is_tampered ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {!result.is_authentic ? 'Unverified' : result.is_tampered ? 'Degraded' : 'Untampered'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VerifyPage;
