import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, EyeSlashIcon, ChartBarIcon, LockClosedIcon, DocumentMagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';

const LandingPage = () => {
  const features = [
    { icon: EyeSlashIcon, title: 'Invisible Watermark', desc: 'Embeds robust data directly into image pixels without affecting visual quality.' },
    { icon: DocumentMagnifyingGlassIcon, title: 'Provenance Tracking', desc: 'Securely tracks the origin, AI model, and generation prompt for any image.' },
    { icon: ShieldCheckIcon, title: 'Tamper Detection', desc: 'Accurately identifies if an image has been manipulated after generation.' },
    { icon: SparklesIcon, title: 'Attack Resilience', desc: 'Survives compression, cropping, noise, and other common image manipulations.' },
    { icon: LockClosedIcon, title: 'Encrypted Metadata', desc: 'Uses advanced cryptography to ensure metadata cannot be spoofed.' },
    { icon: ChartBarIcon, title: 'Performance Metrics', desc: 'Detailed analysis using PSNR, SSIM, BER, and NC scores.' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-24">
        <nav className="flex justify-between items-center mb-24">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-10 h-10 text-indigo-500" />
            <span className="text-2xl font-bold text-gradient">ProvenAI</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="px-6 py-2 text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
            <Link to="/register" className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">Sign Up</Link>
          </div>
        </nav>

        <main>
          <div className="text-center max-w-4xl mx-auto mb-32">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-8"
            >
              Securing the Future of <br/>
              <span className="text-gradient">AI Image Provenance</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-400 mb-12"
            >
              Protect your intellectual property and verify the authenticity of AI-generated content with our advanced invisible watermarking technology.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-6"
            >
              <Link to="/register" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:scale-105">
                Get Started
              </Link>
              <a href="#features" className="px-8 py-4 glass-panel hover:bg-white/10 text-white rounded-xl font-bold text-lg transition-all hover:scale-105">
                Learn More
              </a>
            </motion.div>
          </div>

          <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel p-8 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                  <feature.icon className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
      
      <footer className="border-t border-white/10 py-12 relative z-10 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500">
          <p>© {new Date().getFullYear()} ProvenAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
