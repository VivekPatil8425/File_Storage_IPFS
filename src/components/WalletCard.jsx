import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, LogOut, Wallet, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';

const WalletCard = ({ account, onDisconnect }) => {
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account && window.ethereum) {
      fetchBalance();
    }
  }, [account]);

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(account);
      setBalance(parseFloat(ethers.utils.formatEther(balance)).toFixed(4));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0.00');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const openEtherscan = () => {
    window.open(`https://sepolia.etherscan.io/address/${account}`, '_blank');
  };

  if (!account) {
    return (
      <motion.div 
        className="glass-card p-6 mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center space-x-3">
          <Wallet className="w-6 h-6 text-gray-400" />
          <span className="text-gray-400">Wallet not connected</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass-card p-6 mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Wallet className="w-6 h-6 text-white" />
          </motion.div>
          
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-semibold gradient-text">Connected Wallet</span>
              <motion.div
                className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-[rgba(255,255,255,0.03)] px-2 py-1 rounded font-mono">
                {formatAddress(account)}
              </code>
              
              <motion.button
                onClick={copyAddress}
                className="p-1 hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-neon-green" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                )}
              </motion.button>
              
              <motion.button
                onClick={openEtherscan}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-400 mb-1">Balance</div>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <motion.div 
                className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <span className="text-lg font-bold gradient-text">{balance} ETH</span>
            )}
          </div>
          
          <motion.button
            onClick={onDisconnect}
            className="mt-2 flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-3 h-3" />
            <span>Disconnect</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default WalletCard;
