import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Copy, Download, Play, Layers, Database } from 'lucide-react';
import { get, set } from 'idb-keyval';
import { ThemeProvider } from './components/ThemeProvider';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreviewGrid } from './components/ImagePreviewGrid';
import { ProgressBar } from './components/ProgressBar';
import { ResultCard } from './components/ResultCard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ImageCropper } from './components/ImageCropper';
import { Archive } from './components/Archive';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SplashScreen } from './components/SplashScreen';
import { Onboarding } from './components/Onboarding';
import { extractTextFromImage } from './services/gemini';
import { ProcessedImage } from './types';

function AppContent() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workspace' | 'archive'>('workspace');
  const [customInstructions, setCustomInstructions] = useState('');
  
  // App initialization state
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Cropper state
  const [cropImageId, setCropImageId] = useState<string | null>(null);

  // Load workspace from IndexedDB on mount
  useEffect(() => {
    get('mutulens-workspace')
      .then((savedImages: ProcessedImage[]) => {
        if (savedImages && savedImages.length > 0) {
          const restoredImages = savedImages.map(img => {
            let url = '';
            try {
              if (img.file) {
                url = URL.createObjectURL(img.file);
              }
            } catch (e) {
              console.error('Failed to create object URL for file', e);
            }
            return {
              ...img,
              previewUrl: url
            };
          });
          setImages(restoredImages);
        }
      })
      .catch(console.error);
  }, []);

  // Save workspace to IndexedDB on change
  useEffect(() => {
    if (images.length === 0) {
      set('mutulens-workspace', []).catch(console.error);
      return;
    }
    
    // Omit previewUrl as it's a blob URL that won't work across sessions
    const imagesToSave = images.map(img => ({
      ...img,
      previewUrl: ''
    }));
    
    set('mutulens-workspace', imagesToSave).catch(console.error);
  }, [images]);

  useEffect(() => {
    const savedKey = localStorage.getItem('mutulens-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    } else if (process.env.GEMINI_API_KEY) {
      setApiKey(process.env.GEMINI_API_KEY);
    }
    setIsCheckingKey(false);

    const hasSeenOnboarding = localStorage.getItem('mutulens-onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('mutulens-onboarding', 'true');
    setShowOnboarding(false);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('mutulens-api-key', key);
  };

  const handleUpload = useCallback((files: File[]) => {
    const newImages: ProcessedImage[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 15),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending'
    }));
    
    setImages(prev => {
      const combined = [...prev, ...newImages];
      if (combined.length > 20) {
        // Revoke URLs for images that will be dropped
        const dropped = combined.slice(20);
        dropped.forEach(img => URL.revokeObjectURL(img.previewUrl));
      }
      return combined.slice(0, 20); // Max 20 units
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  const handleClear = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    setIsProcessing(false);
  }, [images]);

  const handleCropComplete = (croppedDataUrl: string) => {
    if (cropImageId) {
      setImages(prev => prev.map(img => 
        img.id === cropImageId ? { ...img, croppedDataUrl } : img
      ));
    }
  };

  const saveToArchive = async (id: string, imageData: string, text: string, latency: number) => {
    try {
      await fetch('/api/extractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          image_data: imageData,
          extracted_text: text,
          latency
        })
      });
    } catch (error) {
      console.error('Failed to save to archive', error);
    }
  };

  const processQueue = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    const pendingImages = images.filter(img => img.status === 'pending');
    if (pendingImages.length === 0) return;

    setIsProcessing(true);

    for (const img of pendingImages) {
      setImages(prev => prev.map(i => 
        i.id === img.id ? { ...i, status: 'processing' } : i
      ));

      const startTime = performance.now();
      try {
        const result = await extractTextFromImage(img.file, apiKey, img.croppedDataUrl, customInstructions);
        const latency = performance.now() - startTime;
        
        setImages(prev => prev.map(i => 
          i.id === img.id ? { 
            ...i, 
            status: 'completed', 
            extractedText: result.text,
            explanation: result.explanation,
            latency 
          } : i
        ));

        // Save to DB
        const imageData = img.croppedDataUrl || await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(img.file);
        });
        await saveToArchive(img.id, imageData, result.text, latency);

      } catch (error: any) {
        setImages(prev => prev.map(i => 
          i.id === img.id ? { 
            ...i, 
            status: 'error', 
            error: error.message || 'Extraction failed' 
          } : i
        ));
      }
    }

    setIsProcessing(false);
  };

  const completedImages = images.filter(img => img.status === 'completed');
  const pendingCount = images.filter(img => img.status === 'pending').length;

  const handleCopyAll = async () => {
    const allText = completedImages
      .map(img => `--- Image ${img.id.slice(0, 6)} ---\n${img.extractedText}`)
      .join('\n\n');
    if (allText) {
      await navigator.clipboard.writeText(allText);
      alert('All extracted text copied to clipboard!');
    }
  };

  const handleExportBundle = () => {
    const allText = completedImages
      .map(img => `--- Image ${img.id.slice(0, 6)} ---\n${img.extractedText}`)
      .join('\n\n');
    if (allText) {
      const blob = new Blob([allText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mutulens_bundle_${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const cropImage = images.find(img => img.id === cropImageId);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!apiKey) {
    return <WelcomeScreen onSave={handleSaveApiKey} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-200">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-white/20 pb-4">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'workspace' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10'
            }`}
          >
            <Layers className="w-4 h-4" />
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'archive' 
                ? 'bg-black text-white dark:bg-white dark:text-black' 
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            Neural Archive
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'workspace' ? (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Neural Ingest Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Active Queue</h2>
                  <div className="flex gap-2">
                    {images.length > 0 && (
                      <button
                        onClick={handleClear}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Clear System</span>
                      </button>
                    )}
                    {pendingCount > 0 && (
                      <button
                        onClick={processQueue}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                        <span>Initialize Engine</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Neural Directives (Custom Instructions)
                    </label>
                  </div>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g., 'Ensure the sequence is clear', 'Explain the logic', 'Decipher messy handwriting'..."
                    className="w-full h-24 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm resize-none"
                  />
                </div>

                <ImageUploader 
                  onUpload={handleUpload} 
                  disabled={isProcessing || images.length >= 20} 
                />

                <ImagePreviewGrid 
                  images={images} 
                  onRemove={handleRemove} 
                  onCrop={setCropImageId}
                />

                {(isProcessing || completedImages.length > 0) && (
                  <div className="pt-4">
                    <ProgressBar 
                      total={images.length} 
                      completed={images.length - pendingCount} 
                      isProcessing={isProcessing} 
                    />
                  </div>
                )}
              </section>

              {/* Extracted Data Section */}
              {completedImages.length > 0 && (
                <section className="space-y-6 pt-8 border-t border-zinc-200 dark:border-white/20">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Extracted Data</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyAll}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-zinc-200 dark:border-white/20 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden sm:inline">Copy All</span>
                      </button>
                      <button
                        onClick={handleExportBundle}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-zinc-200 dark:border-white/20 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export Bundle</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {images.map(img => (
                      <ResultCard key={img.id} image={img} />
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="archive"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Archive />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey || ''}
      />

      {cropImage && (
        <ImageCropper
          isOpen={!!cropImageId}
          imageUrl={cropImage.previewUrl}
          onClose={() => setCropImageId(null)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
