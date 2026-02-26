import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] overflow-hidden relative">
          <motion.div 
            initial={{ rotate: -90, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            className="w-12 h-12 border-4 border-black rounded-xl z-10" 
          />
          {/* Scanning line effect */}
          <motion.div
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
            transition={{ delay: 0.8, duration: 1.5, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-20"
          />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h1 className="text-3xl font-bold tracking-widest uppercase">MutuLens AI</h1>
        <p className="text-zinc-500 mt-2 font-mono text-xs tracking-widest">Neural Engine Initializing...</p>
      </motion.div>
    </div>
  );
};
