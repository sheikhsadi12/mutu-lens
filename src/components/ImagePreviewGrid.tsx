import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, CheckCircle2, AlertCircle, Crop as CropIcon } from 'lucide-react';
import { ProcessedImage } from '../types';

interface ImagePreviewGridProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  onCrop: (id: string) => void;
}

export const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({ images, onRemove, onCrop }) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <AnimatePresence mode="popLayout">
        {images.map((img) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            key={img.id}
            className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-white/20 group bg-zinc-100 dark:bg-zinc-900"
          >
            <img 
              src={img.croppedDataUrl || img.previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            
            {/* Action Icons (Crop & Remove) */}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              {img.status === 'pending' && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCrop(img.id); }}
                    className="p-1.5 bg-white dark:bg-black text-black dark:text-white rounded-full shadow-sm hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
                    title="Crop Image"
                  >
                    <CropIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
                    className="p-1.5 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-black shadow-sm z-10">
              {img.status === 'pending' && <div className="w-2 h-2 rounded-full bg-zinc-400" />}
              {img.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              {img.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {img.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
