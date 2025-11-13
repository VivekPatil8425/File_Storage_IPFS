import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-neon-green" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-neon-blue" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-neon-green/20 border-neon-green/50';
      case 'error':
        return 'bg-red-500/20 border-red-500/50';
      case 'info':
      default:
        return 'bg-neon-blue/20 border-neon-blue/50';
    }
  };

  return (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md"
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className={`glass-card border-2 p-4 ${getBgColor(notification.type)}`}
            whileHover={{ scale: 1.02 }}
            layout
          >
            <div className="flex items-start space-x-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              >
                {getIcon(notification.type)}
              </motion.div>
              
              <div className="flex-1">
                <p className="text-white font-medium text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-1 hover:bg-[rgba(255,255,255,0.04)] rounded transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </motion.button>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              className="mt-3 h-1 bg-[rgba(255,255,255,0.10)] rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className={`h-full ${
                  notification.type === 'success' ? 'bg-neon-green' :
                  notification.type === 'error' ? 'bg-red-400' : 'bg-neon-blue'
                }`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: "linear" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
