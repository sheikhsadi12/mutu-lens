import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Monitor, ClipboardPaste } from 'lucide-react';

interface FloatingActionMenuProps {
  onCaptureScreen: () => void;
  onPasteClipboard: () => void;
}

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onCaptureScreen, onPasteClipboard }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                onCaptureScreen();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-full shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-white/10"
              title="Capture Screen"
            >
              <span className="text-sm font-medium">Capture Screen</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Monitor className="w-4 h-4" />
              </div>
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                onPasteClipboard();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-800 text-black dark:text-white rounded-full shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-white/10"
              title="Paste from Clipboard"
            >
              <span className="text-sm font-medium">Paste Image</span>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ClipboardPaste className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-black text-white dark:bg-white dark:text-black rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        aria-label="Quick Actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </button>
    </div>
  );
};
