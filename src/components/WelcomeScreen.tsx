import React, { useState } from 'react';
import { Key, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';

interface WelcomeScreenProps {
  onSave: (key: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSave }) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleSave = () => {
    if (!keyInput.trim()) {
      setError('API Key is required.');
      return;
    }
    
    if (!keyInput.startsWith('AIza')) {
      setError('Invalid API Key format. It should start with "AIza".');
      return;
    }
    
    onSave(keyInput.trim());
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col items-center justify-center p-4 transition-colors duration-200">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <div className="w-8 h-8 border-4 border-white dark:border-black rounded-md" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">MutuLens AI</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Neural Engine OCR Workspace</p>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 space-y-6 shadow-xl">
          <div className="space-y-2">
            <h2 className="font-semibold flex items-center gap-2">
              <Key className="w-5 h-5" />
              Access Protocol
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Enter your Gemini API Key to initialize the Neural Engine. Your key is stored locally and never sent to our servers.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              API Key
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="AIza..."
              className="w-full px-4 py-3 bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-mono text-sm"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-opacity"
          >
            Initialize Workspace
          </button>
        </div>
      </motion.div>
    </div>
  );
};
