import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  total: number;
  completed: number;
  isProcessing: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ total, completed, isProcessing }) => {
  if (total === 0) return null;

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        <span>Neural Processing</span>
        <span>{completed} / {total} UNITS ({percentage}%)</span>
      </div>
      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-white/10">
        <motion.div
          className="h-full bg-black dark:bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
      {isProcessing && (
        <div className="flex justify-center">
          <span className="text-xs font-mono text-zinc-400 animate-pulse">
            EXTRACTING DATA...
          </span>
        </div>
      )}
    </div>
  );
};
