import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { strings as allStrings } from './strings';

type Language = 'en' | 'es' | 'nl' | 'pl' | 'fr' | 'de'; // Supported languages

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof allStrings['en']) => string;
}

const LANGUAGE_STORAGE_KEY = '@app_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang === 'en' || storedLang === 'es' || storedLang === 'nl' || storedLang === 'pl' || storedLang === 'fr' || storedLang === 'de') {
          setLanguageState(storedLang as Language);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = (key: keyof typeof allStrings['en']) => {
    return (allStrings[language] as any)[key] || key;
  };

  if (!isLoaded) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
