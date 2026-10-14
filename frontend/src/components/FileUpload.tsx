import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  label?: string;
}

const FileUpload = ({ onFileSelect, accept = 'image/*', label = 'Drag & drop an image here, or click to select' }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    onFileSelect(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
            dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            id="file-upload"
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleChange}
          />
          <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-300 font-medium">{label}</p>
          <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG, WEBP (Max 10MB)</p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 flex flex-col md:flex-row items-center gap-6"
        >
          {preview ? (
            <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/50">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-xl flex items-center justify-center bg-slate-800 border border-white/10 shrink-0">
              <DocumentIcon className="w-12 h-12 text-slate-500" />
            </div>
          )}
          
          <div className="flex-1 min-w-0 text-center md:text-left">
            <h4 className="text-lg font-medium text-white truncate">{file.name}</h4>
            <p className="text-slate-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          
          <button 
            onClick={clearFile}
            className="p-2 rounded-full hover:bg-rose-500/20 text-rose-400 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
