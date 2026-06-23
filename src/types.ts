export interface TranslationResult {
  text: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  original: string;
  translation: string;
  timestamp: number;
  sourceLang?: string;
  targetLang?: string;
}
