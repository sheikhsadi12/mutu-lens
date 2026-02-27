import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void | Promise<void>;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      
      const files = Array.from(e.dataTransfer.files as FileList).filter(file => 
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onUpload(files);
      }
    },
    [onUpload, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !e.target.files) return;
      
      const files = Array.from(e.target.files as FileList).filter(file => 
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onUpload(files);
      }
      // Reset input so the same files can be selected again if needed
      e.target.value = '';
    },
    [onUpload, disabled]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative w-full p-8 border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-4 min-h-[240px]
        ${disabled 
          ? 'border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50 opacity-50 cursor-not-allowed' 
          : 'border-zinc-300 dark:border-white/30 hover:border-black dark:hover:border-white bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer'
        }`}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      <div className="w-16 h-16 bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-full flex items-center justify-center shadow-sm">
        <UploadCloud className="w-8 h-8 text-zinc-600 dark:text-zinc-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-semibold text-lg">Neural Ingest</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Drag & drop images here, or click to select
        </p>
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-2">
          MAX 20 UNITS PER BATCH
        </p>
      </div>
    </div>
  );
};
