import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check, Eye, Download, Zap, Calendar, User, Hash } from 'lucide-react';

const FileCard = ({ file, index, onRetrieve }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return '🖼️';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      case 'mp3':
      case 'wav':
      case 'flac':
        return '🎵';
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'zip':
      case 'rar':
        return '📦';
      default:
        return '📁';
    }
  };

  return (
    <motion.div
      className="glass-card p-6 hover:shadow-neon transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="text-3xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            {getFileIcon(file.name)}
          </motion.div>
          <div>
            <h3 className="font-semibold text-white truncate max-w-[200px]" title={file.name}>
              {file.name}
            </h3>
            <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
          </div>
        </div>
        
        <motion.div
          className="flex items-center space-x-1 bg-gradient-to-r from-neon-purple to-neon-blue px-2 py-1 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          <Zap className="w-3 h-3" />
          <span className="text-xs font-semibold">{file.gasUsed} gas</span>
        </motion.div>
      </div>

      {/* File Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">CID:</span>
          <code className="bg-[rgba(255,255,255,0.03)] px-2 py-1 rounded text-xs font-mono flex-1 truncate">
            {file.cid}
          </code>
          <motion.button
            onClick={() => copyToClipboard(file.cid)}
            className="p-1 hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {copied ? (
              <Check className="w-4 h-4 text-neon-green" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">Uploaded:</span>
          <span className="text-white">{formatDate(file.timestamp)}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400">By:</span>
          <code className="bg-[rgba(255,255,255,0.03)] px-2 py-1 rounded text-xs font-mono">
            {file.uploader?.substring(0, 6)}...{file.uploader?.substring(38)}
          </code>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <motion.button
          onClick={() => onRetrieve(file.cid)}
          className="flex-1 cyber-button flex items-center justify-center space-x-2 py-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </motion.button>

        <motion.button
          onClick={() => window.open(`https://ipfs.io/ipfs/${file.cid}`, '_blank')}
          className="px-4 py-2 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-colors flex items-center space-x-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ExternalLink className="w-4 h-4" />
        </motion.button>

        <motion.button
          onClick={() => {
            const link = document.createElement('a');
            link.href = `https://ipfs.io/ipfs/${file.cid}`;
            link.download = file.name;
            link.click();
          }}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center space-x-2 text-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Blockchain Verification Badge */}
      <motion.div
        className="mt-4 flex items-center justify-center space-x-2 text-xs text-neon-green"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 bg-neon-green rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span>Verified on Blockchain</span>
      </motion.div>
    </motion.div>
  );
};

export default FileCard;
