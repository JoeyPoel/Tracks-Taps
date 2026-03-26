import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';

import { strings as allStrings } from './strings';

interface TranslationCache {
  [key: string]: string;
}

interface TranslationContextType {
  isAutoTranslateEnabled: boolean;
  setIsAutoTranslateEnabled: (enabled: boolean) => void;
  translateText: (text: string, force?: boolean) => string;
  cacheTranslation: (original: string, translated: string) => void;
  clearCache: () => void;
}

const TRANSLATION_CONFIG_KEY = '@app_auto_translate_enabled';
const TRANSLATION_CACHE_KEY_PREFIX = '@app_translation_cache_';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const [isAutoTranslateEnabled, setIsAutoTranslateEnabledState] = useState(false);
  const [cache, setCache] = useState<TranslationCache>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load configuration and cache for current language
  useEffect(() => {
    const loadData = async () => {
      try {
        const [config, storedCache] = await Promise.all([
          AsyncStorage.getItem(TRANSLATION_CONFIG_KEY),
          AsyncStorage.getItem(`${TRANSLATION_CACHE_KEY_PREFIX}${language}`)
        ]);

        if (config !== null) {
          setIsAutoTranslateEnabledState(config === 'true');
        }

        if (storedCache !== null) {
          setCache(JSON.parse(storedCache));
        } else {
          setCache({});
        }
      } catch (e) {
        console.error('Failed to load translation data', e);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, [language]);

  const setIsAutoTranslateEnabled = async (enabled: boolean) => {
    setIsAutoTranslateEnabledState(enabled);
    try {
      await AsyncStorage.setItem(TRANSLATION_CONFIG_KEY, enabled.toString());
    } catch (e) {
      console.error('Failed to save translation config', e);
    }
  };

  const cacheTranslation = async (original: string, translated: string) => {
    if (!original || !translated || original === translated) return;

    const newCache = { ...cache, [original]: translated };
    setCache(newCache);

    try {
      await AsyncStorage.setItem(
        `${TRANSLATION_CACHE_KEY_PREFIX}${language}`,
        JSON.stringify(newCache)
      );
    } catch (e) {
      console.error('Failed to save translation to cache', e);
    }
  };

  const translateText = (text: string, force: boolean = false): string => {
    if (!text) return text;

    // 1. Check strings.ts first (priority)
    const enStrings = allStrings.en;
    const key = Object.keys(enStrings).find(k => (enStrings as any)[k] === text);
    if (key) {
      return (allStrings[language] as any)[key] || text;
    }

    // 2. Check cache if auto-translate is enabled or forced
    if (!isAutoTranslateEnabled && !force) return text;
    return cache[text] || text;
  };

  const clearCache = async () => {
    setCache({});
    try {
      await AsyncStorage.removeItem(`${TRANSLATION_CACHE_KEY_PREFIX}${language}`);
    } catch (e) {
      console.error('Failed to clear translation cache', e);
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        isAutoTranslateEnabled,
        setIsAutoTranslateEnabled,
        translateText,
        cacheTranslation,
        clearCache
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
