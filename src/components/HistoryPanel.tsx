import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, ArrowRight, Search } from "lucide-react";
import type { HistoryItem } from "../types";

interface HistoryPanelProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onSelect: (item: HistoryItem) => void;
}

export function HistoryPanel({ history, onClearHistory, onSelect }: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const query = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.original.toLowerCase().includes(query) ||
        item.translation.toLowerCase().includes(query)
    );
  }, [history, searchQuery]);

  if (history.length === 0) return null;

  return (
    <div className="w-full bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:block">
          Recent Queries
        </h3>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 sm:justify-end sm:max-w-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-full pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <button
            onClick={onClearHistory}
            className="text-xs flex-shrink-0 text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1.5 rounded hover:bg-slate-800"
            aria-label="Clear history"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {filteredHistory.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={`${item.id}-${item.timestamp}-${index}`}
              onClick={() => onSelect(item)}
              className="px-4 py-2 bg-slate-800 rounded-full text-xs text-slate-300 border border-slate-700 hover:border-blue-500 cursor-pointer transition-all flex items-center gap-2 group max-w-full"
            >
              <span className="truncate max-w-[120px] sm:max-w-[200px]" title={item.original}>{item.original}</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-[200px] text-slate-400" title={item.translation}>{item.translation}</span>
            </motion.div>
          ))}
          {filteredHistory.length === 0 && (
            <div className="text-sm text-slate-500 italic py-4 w-full text-center">
              No matching queries found.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
