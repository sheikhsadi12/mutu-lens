import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Download, Check, Clock, FileText, FileDown } from 'lucide-react';
import { ProcessedImage } from '../types';
import jsPDF from 'jspdf';

interface ResultCardProps {
  image: ProcessedImage;
}

export const ResultCard: React.FC<ResultCardProps> = ({ image }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (image.extractedText) {
      await navigator.clipboard.writeText(image.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTXT = () => {
    if (image.extractedText) {
      const blob = new Blob([image.extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extraction_${image.id.slice(0, 6)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadMD = () => {
    if (image.extractedText) {
      const blob = new Blob([image.extractedText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `extraction_${image.id.slice(0, 6)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadPDF = () => {
    if (image.extractedText) {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(image.extractedText, 180);
      doc.text(splitText, 15, 15);
      doc.save(`extraction_${image.id.slice(0, 6)}.pdf`);
    }
  };

  if (image.status !== 'completed' && image.status !== 'error' && image.status !== 'processing') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm"
    >
      <div className="w-full md:w-48 h-48 md:h-auto border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/20 bg-zinc-50 dark:bg-zinc-900 shrink-0">
        <img 
          src={image.croppedDataUrl || image.previewUrl} 
          alt="Source" 
          className="w-full h-full object-contain p-2"
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-zinc-200 dark:border-white/20 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase">
              ID: {image.id.slice(0, 8)}
            </span>
            {image.latency && (
              <span className="flex items-center gap-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3 h-3" />
                {(image.latency / 1000).toFixed(2)}s
              </span>
            )}
          </div>
          
          {image.status === 'completed' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors text-zinc-600 dark:text-zinc-300"
                title="Copy Text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownloadTXT}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors text-zinc-600 dark:text-zinc-300"
                title="Download TXT"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadMD}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors text-zinc-600 dark:text-zinc-300"
                title="Download Markdown"
              >
                <FileDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors text-zinc-600 dark:text-zinc-300"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 overflow-auto max-h-64 md:max-h-96">
          {image.status === 'processing' ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>
          ) : image.status === 'error' ? (
            <div className="text-red-500 text-sm font-mono">
              Error: {image.error || 'Failed to extract text'}
            </div>
          ) : (
            <div className="space-y-4">
              <pre className="text-sm font-sans whitespace-pre-wrap break-words">
                {image.extractedText || <span className="text-zinc-400 italic">No text detected.</span>}
              </pre>
              
              {image.explanation && (
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">Sequencing Analysis</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {image.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
