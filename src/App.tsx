import React, { useState, useEffect } from "react";
import { TranslationCard } from "./components/TranslationCard";
import { HistoryPanel } from "./components/HistoryPanel";
import type { HistoryItem } from "./types";

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ru2en_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map((item: any, i: number) => ({
          ...item,
          id: item.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${item.timestamp || Date.now()}-${i}`),
        }));
        setHistory(mapped);
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem("ru2en_history", JSON.stringify(items));
  };

  const handleTranslate = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, sourceLanguage: sourceLang, targetLanguage: targetLang }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to translate");
    }

    const { translation } = await response.json();

    const newItem: HistoryItem = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random()}`,
      original: text,
      translation,
      timestamp: Date.now(),
      sourceLang,
      targetLang,
    };

    saveHistory([newItem, ...history].slice(0, 9)); // Keep last 9 items

    return translation;
  };

  const handleClearCard = () => {
    // Optionally focus input or trigger small animation
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setSelectedItem({ ...item });
    // Scroll to the translation card for mobile convenience
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col overflow-x-hidden">
      {/* Top Navigation / Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-6 bg-slate-900/50 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-xl">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              RomanAI Translator <span className="text-blue-400 text-sm font-medium ml-2 hidden sm:inline">v2.5 Flash</span>
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest hidden sm:block">Intelligent Phonetic Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300 hidden sm:inline">Gemini Core Active</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 flex flex-col space-y-6 md:space-y-8 lg:h-[calc(100vh-88px)] lg:max-h-[800px]">
        <TranslationCard 
          onTranslate={handleTranslate} 
          onClear={handleClearCard}
          selectedHistoryItem={selectedItem}
        />

        {/* History Area */}
        <div className="w-full">
          <HistoryPanel 
            history={history} 
            onClearHistory={() => saveHistory([])} 
            onSelect={handleRestoreHistory} 
          />
        </div>
      </main>

      {/* Footer Accessibility / Status Bar */}
      <footer className="px-4 md:px-8 py-4 bg-slate-950/50 flex flex-col sm:flex-row justify-between items-center sm:border-t border-slate-800 text-[10px] text-slate-600 mt-auto">
        <div className="flex space-x-4 mb-2 sm:mb-0">
          <span className="flex items-center"><div className="w-1 h-1 bg-slate-600 rounded-full mr-2"></div> Local Storage Active</span>
          <span className="flex items-center"><div className="w-1 h-1 bg-slate-600 rounded-full mr-2"></div> High Contrast Enabled</span>
        </div>
        <div className="font-mono">SYSTEM_ID: BOLI_772_DARK</div>
      </footer>
    </div>
  );
}
