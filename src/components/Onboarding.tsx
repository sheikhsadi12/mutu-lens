import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanText, Database, Crop, ArrowRight, CheckCircle2, Download } from 'lucide-react';

const features = [
  {
    icon: <ScanText className="w-10 h-10" />,
    title: "Neural Extraction",
    description: "Advanced OCR powered by Gemini 2.5 Flash. Deciphers messy handwriting and jumbled text with ease."
  },
  {
    icon: <Crop className="w-10 h-10" />,
    title: "Precision Targeting",
    description: "Use the Region of Interest (ROI) tool to crop and extract text from specific parts of your images."
  },
  {
    icon: <Database className="w-10 h-10" />,
    title: "Persistent Archive",
    description: "All your extractions are securely stored in a local SQLite database for instant search and retrieval."
  }
];

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleNext = () => {
    if (step < features.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-6">
      <div className="w-full max-w-md flex flex-col h-full justify-between py-12">
        
        <div className="flex justify-center gap-2 mb-12">
          {features.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-black dark:bg-white' : 'w-2 bg-zinc-300 dark:bg-zinc-700'}`}
            />
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 mx-auto bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center text-black dark:text-white shadow-lg border border-zinc-200 dark:border-white/10">
                {features[step].icon}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">{features[step].title}</h2>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-lg">
                {features[step].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          {step === features.length - 1 && deferredPrompt && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInstallClick}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-xl hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Install MutuLens App
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium flex items-center justify-center gap-2 shadow-xl"
          >
            {step === features.length - 1 ? (
              <>Get Started <CheckCircle2 className="w-5 h-5" /></>
            ) : (
              <>Next <ArrowRight className="w-5 h-5" /></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
