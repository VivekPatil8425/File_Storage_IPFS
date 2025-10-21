import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Link, LinkOff } from 'lucide-react';

const NetworkStatus = ({ contract, account }) => {
  const [ipfsStatus, setIpfsStatus] = useState('checking');
  const [ethStatus, setEthStatus] = useState('checking');

  useEffect(() => {
    // Check IPFS status
    const checkIPFS = async () => {
      try {
        // Simple check by trying to fetch IPFS gateway
        const response = await fetch('https://ipfs.io/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG/readme', {
          method: 'HEAD',
          timeout: 5000
        });
        setIpfsStatus(response.ok ? 'connected' : 'disconnected');
      } catch (error) {
        setIpfsStatus('disconnected');
      }
    };

    // Check Ethereum status
    const checkEthereum = () => {
      if (account && contract) {
        setEthStatus('connected');
      } else if (window.ethereum) {
        setEthStatus('available');
      } else {
        setEthStatus('disconnected');
      }
    };

    checkIPFS();
    checkEthereum();
  }, [contract, account]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-neon-green';
      case 'available': return 'text-neon-yellow';
      case 'checking': return 'text-neon-blue';
      default: return 'text-red-400';
    }
  };

  const getStatusIcon = (status, type) => {
    const IconComponent = type === 'ipfs' ? 
      (status === 'connected' ? Wifi : WifiOff) : 
      (status === 'connected' ? Link : LinkOff);
    
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <motion.div 
      className="glass-card p-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-sm font-semibold mb-3 gradient-text">Network Status</h3>
      
      <div className="flex justify-between items-center space-x-4">
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ 
              rotate: ipfsStatus === 'checking' ? 360 : 0,
              scale: ipfsStatus === 'connected' ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: ipfsStatus === 'checking' ? Infinity : 0 },
              scale: { duration: 0.5 }
            }}
            className={getStatusColor(ipfsStatus)}
          >
            {getStatusIcon(ipfsStatus, 'ipfs')}
          </motion.div>
          <span className="text-xs">IPFS</span>
          <div className={`w-2 h-2 rounded-full ${
            ipfsStatus === 'connected' ? 'bg-neon-green animate-pulse' : 
            ipfsStatus === 'checking' ? 'bg-neon-blue animate-pulse' : 'bg-red-400'
          }`} />
        </motion.div>

        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <motion.div
            animate={{ 
              rotate: ethStatus === 'checking' ? 360 : 0,
              scale: ethStatus === 'connected' ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: ethStatus === 'checking' ? Infinity : 0 },
              scale: { duration: 0.5 }
            }}
            className={getStatusColor(ethStatus)}
          >
            {getStatusIcon(ethStatus, 'ethereum')}
          </motion.div>
          <span className="text-xs">Ethereum</span>
          <div className={`w-2 h-2 rounded-full ${
            ethStatus === 'connected' ? 'bg-neon-green animate-pulse' : 
            ethStatus === 'available' ? 'bg-neon-yellow animate-pulse' :
            ethStatus === 'checking' ? 'bg-neon-blue animate-pulse' : 'bg-red-400'
          }`} />
        </motion.div>

        <div className="text-xs text-gray-400">
          Sepolia Testnet
        </div>
      </div>
    </motion.div>
  );
};

export default NetworkStatus;
