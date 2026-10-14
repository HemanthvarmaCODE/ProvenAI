import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageCompareProps {
  originalSrc: string;
  modifiedSrc: string;
  originalLabel?: string;
  modifiedLabel?: string;
}

const ImageCompare = ({ 
  originalSrc, 
  modifiedSrc, 
  originalLabel = "Original", 
  modifiedLabel = "Watermarked" 
}: ImageCompareProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovered, setIsHovered] = useState(false);

  const handleMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ('touches' in event) 
      ? event.touches[0].clientX - rect.left 
      : (event as React.MouseEvent).clientX - rect.left;
    
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/10 shadow-2xl"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Original Image (Background) */}
        <div className="absolute inset-0 bg-slate-900">
          <img 
            src={originalSrc} 
            alt="Original" 
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Modified Image (Foreground, clipped) */}
        <div 
          className="absolute inset-0 bg-slate-900 border-r-2 border-indigo-500"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img 
            src={modifiedSrc} 
            alt="Modified" 
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        {/* Labels (fade in on hover) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white pointer-events-none"
        >
          {originalLabel}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
          className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-medium text-white pointer-events-none"
        >
          {modifiedLabel}
        </motion.div>
      </div>
      
      <div className="flex justify-between w-full max-w-3xl mt-4 text-sm font-medium text-slate-400 px-2">
        <span>{originalLabel}</span>
        <span>{modifiedLabel}</span>
      </div>
    </div>
  );
};

export default ImageCompare;
