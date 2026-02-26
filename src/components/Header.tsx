import React, { useState, useEffect } from 'react';
import { Sun, Moon, Settings, Download } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { theme, toggleTheme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-zinc-200 dark:border-white/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white dark:border-black rounded-sm" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">MutuLens AI</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-zinc-200 dark:border-white/20 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>
          )}
          
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onOpenSettings}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
