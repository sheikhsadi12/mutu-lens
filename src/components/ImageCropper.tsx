import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ isOpen, imageUrl, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  };

  const handleComplete = () => {
    if (imgRef.current && crop && crop.width && crop.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          imgRef.current,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width * scaleX,
          crop.height * scaleY
        );

        const base64Image = canvas.toDataURL('image/jpeg');
        onCropComplete(base64Image);
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-3xl bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-white/20 shrink-0">
              <h2 className="font-semibold text-lg">Region of Interest (ROI)</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
              <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-w-full max-h-[60vh] object-contain"
                  crossOrigin="anonymous"
                />
              </ReactCrop>
            </div>
            
            <div className="p-4 border-t border-zinc-200 dark:border-white/20 flex justify-end gap-2 shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-black text-white dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              >
                <Check className="w-4 h-4" />
                Apply Crop
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
