import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

const DragDropUpload = ({ onFileSelect, selectedFile, uploading, uploadProgress, onClearFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: uploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (!file) return File;
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'text': return '📄';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <motion.div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive || dragActive 
              ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan' 
              : 'border-gray-600 hover:border-neon-purple hover:bg-neon-purple/5'
            }
            ${uploading ? 'cursor-not-allowed opacity-50' : ''}
          `}
          whileHover={{ scale: uploading ? 1 : 1.02 }}
          whileTap={{ scale: uploading ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <input {...getInputProps()} />
          
          <motion.div
            animate={{ 
              y: isDragActive ? -10 : 0,
              scale: isDragActive ? 1.1 : 1 
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              isDragActive ? 'text-neon-cyan' : 'text-gray-400'
            }`} />
          </motion.div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? (
              <span className="gradient-text">Drop your file here</span>
            ) : (
              'Drag & drop your file here'
            )}
          </h3>
          
          <p className="text-gray-400 mb-4">
            or <span className="text-neon-purple font-semibold">browse files</span>
          </p>
          
          <div className="text-xs text-gray-500">
            Supports all file types • Max size: 100MB
          </div>

          {/* Animated background effect */}
          <AnimatePresence>
            {isDragActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-cyan/20 rounded-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold gradient-text">Selected File</h3>
            {!uploading && (
              <motion.button
                onClick={onClearFile}
                className="p-2 hover:bg-red-500/20 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-red-400" />
              </motion.button>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="text-3xl">{getFileIcon(selectedFile)}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-white truncate">{selectedFile.name}</h4>
              <p className="text-sm text-gray-400">{formatFileSize(selectedFile.size)}</p>
              <p className="text-xs text-gray-500">{selectedFile.type || 'Unknown type'}</p>
            </div>
            
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-6 h-6 text-neon-blue" />
              </motion.div>
            ) : (
              <CheckCircle className="w-6 h-6 text-neon-green" />
            )}
          </div>

          {/* Upload Progress */}
          <AnimatePresence>
            {uploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Uploading...</span>
                  <span className="text-neon-blue font-semibold">{uploadProgress}%</span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  {uploadProgress < 30 && <div>📤 Uploading to IPFS...</div>}
                  {uploadProgress >= 30 && uploadProgress < 70 && <div>🔗 Storing on blockchain...</div>}
                  {uploadProgress >= 70 && uploadProgress < 100 && <div>⏳ Confirming transaction...</div>}
                  {uploadProgress === 100 && <div className="text-neon-green">✅ Upload complete!</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default DragDropUpload;
