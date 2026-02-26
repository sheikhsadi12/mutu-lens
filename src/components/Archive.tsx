import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Clock, FileText, Trash2 } from 'lucide-react';
import { ExtractionRecord } from '../types';

export const Archive: React.FC = () => {
  const [records, setRecords] = useState<ExtractionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/extractions');
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/extractions/${id}`, { method: 'DELETE' });
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete record', error);
    }
  };

  const filteredRecords = records.filter(r => 
    r.extracted_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Neural Archive</h2>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search extractions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm"
          />
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          No records found in the archive.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px]">
          {filteredRecords.map((record, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={record.id}
              className={`group relative bg-white dark:bg-black border border-zinc-200 dark:border-white/20 rounded-2xl overflow-hidden flex flex-col hover:border-black dark:hover:border-white transition-colors cursor-pointer ${
                i % 4 === 0 ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
                <img src={record.image_data} alt="" className="w-full h-full object-cover" />
              </div>
              
              <div className="relative p-4 flex-1 flex flex-col min-h-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    {new Date(record.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-sans text-zinc-800 dark:text-zinc-200 line-clamp-4">
                    {record.extracted_text}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center gap-4 border-t border-zinc-200 dark:border-white/10 pt-3">
                  <span className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                    <Clock className="w-3 h-3" />
                    {(record.latency / 1000).toFixed(2)}s
                  </span>
                  <span className="flex items-center gap-1 text-xs font-mono text-zinc-500">
                    <FileText className="w-3 h-3" />
                    {record.extracted_text.length} chars
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
