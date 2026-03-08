import { useMemo, useState, type ReactNode } from 'react';
import { LanguageContext, type LanguageContextValue } from './context';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'dsa-language';

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'zh') {
    return stored;
  }

  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const value = useMemo<LanguageContextValue>(() => {
    return {
      language,
      toggleLanguage: () => {
        setLanguage((current) => {
          const next: Language = current === 'en' ? 'zh' : 'en';
          localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      },
      t: (key) => translations[language][key],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
