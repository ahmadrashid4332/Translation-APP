import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Copy, Check, X, Loader2, Volume2, ArrowLeftRight, ArrowUpDown, ClipboardPaste } from "lucide-react";
import { cn } from "../utils";
import type { HistoryItem } from "../types";

interface TranslationCardProps {
  onTranslate: (text: string, sourceLang: string, targetLang: string) => Promise<string>;
  onClear: () => void;
  selectedHistoryItem?: HistoryItem | null;
}

export function TranslationCard({ onTranslate, onClear, selectedHistoryItem }: TranslationCardProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [sourceLang, setSourceLang] = useState<'ru' | 'en'>('ru');
  const [targetLang, setTargetLang] = useState<'en' | 'ru'>('en');

  useEffect(() => {
    if (selectedHistoryItem) {
      setInput(selectedHistoryItem.original);
      setOutput(selectedHistoryItem.translation);
      if (selectedHistoryItem.sourceLang && selectedHistoryItem.targetLang) {
        setSourceLang(selectedHistoryItem.sourceLang as 'ru' | 'en');
        setTargetLang(selectedHistoryItem.targetLang as 'en' | 'ru');
      } else {
        setSourceLang('ru');
        setTargetLang('en');
      }
      setError(null);
    }
  }, [selectedHistoryItem]);

  const handleTranslate = async () => {
    if (!input.trim() || isTranslating) return;
    setIsTranslating(true);
    setError(null);
    try {
      const result = await onTranslate(input, sourceLang, targetLang);
      setOutput(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to translate");
      } else {
        setError("Failed to translate");
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    onClear();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      // Fallback for browsers that don't support clipboard API fully or permission denied
      setError("Clipboard access is restricted in this preview. Please click the 'New Tab' icon to paste, or enter manually.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const speakText = (text: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    } else {
      setError("Text-to-speech is not supported in your browser.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInput(output);
    setOutput(input);
    setError(null);
  };

  const sourceTitle = sourceLang === 'ru' ? "Roman Urdu" : "English";
  const targetTitle = targetLang === 'en' ? "English" : "Roman Urdu";
  const sourcePlaceholder = sourceLang === 'ru' ? "Yahan type karein... (e.g. Ni, wo nahi aa raha)" : "Type your English text here...";
  const targetPlaceholder = "Translation will appear here...";

  return (
    <div className="flex-1 w-full flex flex-col bg-slate-800/50 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* Source Side */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-700/50 relative min-h-[300px]">
          <div className="flex items-center justify-between min-h-[32px]">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-md uppercase tracking-wider border border-blue-500/20 w-max">{sourceTitle}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePaste}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center transition-colors focus:outline-none"
                aria-label="Paste text from clipboard"
              >
                <ClipboardPaste className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Paste</span>
              </button>
              {sourceLang === 'en' && input && (
                <button
                  onClick={() => speakText(input, 'en-US')}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center transition-colors focus:outline-none ml-2"
                  aria-label="Listen to English text"
                >
                  <Volume2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Listen</span>
                </button>
              )}
              {input && (
                <button
                  onClick={handleClear}
                  className="text-xs text-slate-500 hover:text-slate-300 flex items-center transition-colors focus:outline-none ml-2"
                  aria-label="Clear input"
                >
                  <X className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Clear Input</span>
                </button>
              )}
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={sourcePlaceholder}
            className="flex-1 w-full mt-6 bg-transparent resize-none border-none focus:ring-0 text-xl lg:text-2xl font-light text-white placeholder-slate-600 outline-none leading-relaxed transition-all overflow-y-auto pr-2 touch-manipulation min-h-[160px]"
            aria-label={`${sourceTitle} input text area`}
          />
        </div>

        {/* Middle Controls */}
        <div className="flex flex-row lg:flex-col items-center justify-center gap-4 p-4 lg:p-6 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-700/50 z-10 shrink-0">
          <button
            onClick={handleSwap}
            className="shrink-0 w-12 h-12 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-blue-500/50 transition-all shadow-lg focus:outline-none"
            aria-label="Swap languages"
          >
            <ArrowLeftRight className="w-5 h-5 hidden lg:block" />
            <ArrowUpDown className="w-5 h-5 block lg:hidden" />
          </button>
          
          <button
            onClick={handleTranslate}
            disabled={!input.trim() || isTranslating}
            className="flex-1 lg:flex-none lg:w-32 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 px-4 py-3 flex lg:flex-col items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm lg:text-xs">Translating...</span>
              </>
            ) : (
              <>
                <span className="text-base lg:text-sm text-nowrap">Translate Now</span>
                <ArrowRight className="w-5 h-5 lg:hidden group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Target Side */}
        <div className="flex-1 flex flex-col p-6 lg:p-8 bg-slate-900/20 relative overflow-hidden min-h-[300px]">
          {/* Gradient Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10 min-h-[32px]">
            <span className="px-3 py-1 bg-violet-500/10 text-violet-400 text-xs font-bold rounded-md uppercase tracking-wider border border-violet-500/20 w-max">{targetTitle}</span>
            <div className="flex items-center space-x-2">
              <AnimatePresence>
                {targetLang === 'en' && output && (
                  <motion.button
                    key="listen-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => speakText(output, 'en-US')}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-all transform hover:scale-110 active:scale-95 group flex items-center justify-center focus:outline-none"
                    aria-label="Listen to English text"
                  >
                    <Volume2 className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  </motion.button>
                )}
                {output && (
                  <motion.button
                    key="copy-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleCopy}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-all transform hover:scale-110 active:scale-95 group flex items-center justify-center focus:outline-none"
                    aria-label="Copy translation"
                  >
                    {copied ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-400"
                      >
                        <Check className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col z-10 mt-6 min-h-[160px]">
            {error ? (
              <div className="text-red-400 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                {error}
              </div>
            ) : isTranslating ? (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500/20 to-violet-500/20 border border-blue-500/30 flex items-center justify-center"
                  >
                    <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                  </motion.div>
                  <span className="text-sm text-blue-300 font-medium animate-pulse tracking-wide">Analyzing semantics...</span>
                </motion.div>
              </div>
            ) : (
              <div className={cn(
                "flex-1 w-full h-full text-xl lg:text-2xl font-light leading-relaxed whitespace-pre-wrap overflow-y-auto pr-2",
                output ? "text-slate-100" : "text-slate-700 italic"
              )}>
                {output || targetPlaceholder}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
