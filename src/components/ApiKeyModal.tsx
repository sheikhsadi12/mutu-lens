import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [keyInput, setKeyInput] = useState(currentKey);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKeyInput(currentKey);
      setError('');
    }
  }, [isOpen, currentKey]);

  const handleSave = () => {
    if (!keyInput.trim()) {
      onSave('');
      onClose();
      return;
    }
    
    if (!keyInput.startsWith('AIza')) {
      setError('Invalid API Key format. It should start with "AIza".');
      return;
    }
    
    onSave(keyInput.trim());
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/20">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                <h2 className="font-semibold text-lg">Access Protocol</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enter your Gemini API Key to enable the Neural Engine. Your key is stored locally and never sent to our servers.
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  API Key
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-mono text-sm"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-white/20 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Protocol
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
