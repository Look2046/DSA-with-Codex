import { createContext } from 'react';
import type { Language, TranslationKey } from './translations';

export type LanguageContextValue = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);
