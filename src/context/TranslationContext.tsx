import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { strings as allStrings } from './strings';
import { useIOSTranslateSheet } from '../hooks/useIOSTranslateSheet';
import { AppModal } from '../components/common/AppModal';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { TextComponent } from '../components/common/TextComponent';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';

type Language = string;

interface TranslationCache {
  [key: string]: string;
}

interface TranslationContextType {
  isAutoTranslateEnabled: boolean;
  setIsAutoTranslateEnabled: (enabled: boolean) => void;
  translateText: (text: string | null | undefined, force?: boolean) => string;
  cacheTranslation: (original: string, translated: string) => void;
  forceTranslate: (text: string | null | undefined, forceLang?: string) => Promise<boolean>;
  requireTranslation: (text: string | null | undefined) => Promise<void>;
  targetLanguage: string | null;
  isTargetLanguageSet: boolean;
  setTargetLanguage: (lang: string | null) => void;
  clearCache: () => void;
}

const TRANSLATION_CONFIG_KEY = '@app_auto_translate_enabled';
const TRANSLATION_TARGET_LANG_KEY = '@app_translation_target_lang';
const TRANSLATION_CACHE_KEY_PREFIX = '@app_translation_cache_';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const SUPPORTED_TRANSLATION_LANGUAGES = [
  { code: 'af', label: 'Afrikaans', flag: '🇿🇦' },
  { code: 'sq', label: 'Albanian', flag: '🇦🇱' },
  { code: 'am', label: 'Amharic', flag: '🇪🇹' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'hy', label: 'Armenian', flag: '🇦🇲' },
  { code: 'az', label: 'Azerbaijani', flag: '🇦🇿' },
  { code: 'eu', label: 'Basque', flag: '🇪🇸' },
  { code: 'be', label: 'Belarusian', flag: '🇧🇾' },
  { code: 'bn', label: 'Bengali', flag: '🇧🇩' },
  { code: 'bs', label: 'Bosnian', flag: '🇧🇦' },
  { code: 'bg', label: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', label: 'Catalan', flag: '🇪🇸' },
  { code: 'ceb', label: 'Cebuano', flag: '🇵🇭' },
  { code: 'ny', label: 'Chichewa', flag: '🇲🇼' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', label: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'co', label: 'Corsican', flag: '🇫🇷' },
  { code: 'hr', label: 'Croatian', flag: '🇭🇷' },
  { code: 'cs', label: 'Czech', flag: '🇨🇿' },
  { code: 'da', label: 'Danish', flag: '🇩🇰' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'eo', label: 'Esperanto', flag: '🌍' },
  { code: 'et', label: 'Estonian', flag: '🇪🇪' },
  { code: 'tl', label: 'Filipino', flag: '🇵🇭' },
  { code: 'fi', label: 'Finnish', flag: '🇫🇮' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'fy', label: 'Frisian', flag: '🇳🇱' },
  { code: 'gl', label: 'Galician', flag: '🇪🇸' },
  { code: 'ka', label: 'Georgian', flag: '🇬🇪' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'el', label: 'Greek', flag: '🇬🇷' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ht', label: 'Haitian Creole', flag: '🇭🇹' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'haw', label: 'Hawaiian', flag: '🇺🇸' },
  { code: 'iw', label: 'Hebrew', flag: '🇮🇱' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'hmn', label: 'Hmong', flag: '🏳️' },
  { code: 'hu', label: 'Hungarian', flag: '🇭🇺' },
  { code: 'is', label: 'Icelandic', flag: '🇮🇸' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'id', label: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', label: 'Irish', flag: '🇮🇪' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'jw', label: 'Javanese', flag: '🇮🇩' },
  { code: 'kn', label: 'Kannada', flag: '🇮🇳' },
  { code: 'kk', label: 'Kazakh', flag: '🇰🇿' },
  { code: 'km', label: 'Khmer', flag: '🇰🇭' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'ku', label: 'Kurdish (Kurmanji)', flag: '🇹🇷' },
  { code: 'ky', label: 'Kyrgyz', flag: '🇰🇬' },
  { code: 'lo', label: 'Lao', flag: '🇱🇦' },
  { code: 'la', label: 'Latin', flag: '🏛️' },
  { code: 'lv', label: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', label: 'Lithuanian', flag: '🇱🇹' },
  { code: 'lb', label: 'Luxembourgish', flag: '🇱🇺' },
  { code: 'mk', label: 'Macedonian', flag: '🇲🇰' },
  { code: 'mg', label: 'Malagasy', flag: '🇲🇬' },
  { code: 'ms', label: 'Malay', flag: '🇲🇾' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳' },
  { code: 'mt', label: 'Maltese', flag: '🇲🇹' },
  { code: 'mi', label: 'Maori', flag: '🇳🇿' },
  { code: 'mr', label: 'Marathi', flag: '🇮🇳' },
  { code: 'mn', label: 'Mongolian', flag: '🇲🇳' },
  { code: 'my', label: 'Myanmar (Burmese)', flag: '🇲🇲' },
  { code: 'ne', label: 'Nepali', flag: '🇳🇵' },
  { code: 'no', label: 'Norwegian', flag: '🇳🇴' },
  { code: 'or', label: 'Odia', flag: '🇮🇳' },
  { code: 'ps', label: 'Pashto', flag: '🇦🇫' },
  { code: 'fa', label: 'Persian', flag: '🇮🇷' },
  { code: 'pl', label: 'Polish', flag: '🇵🇱' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'pa', label: 'Punjabi', flag: '🇮🇳' },
  { code: 'ro', label: 'Romanian', flag: '🇷🇴' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'sm', label: 'Samoan', flag: '🇼🇸' },
  { code: 'gd', label: 'Scots Gaelic', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { code: 'sr', label: 'Serbian', flag: '🇷🇸' },
  { code: 'st', label: 'Sesotho', flag: '🇿🇦' },
  { code: 'sn', label: 'Shona', flag: '🇿🇼' },
  { code: 'sd', label: 'Sindhi', flag: '🇵🇰' },
  { code: 'si', label: 'Sinhala', flag: '🇱🇰' },
  { code: 'sk', label: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', label: 'Slovenian', flag: '🇸🇮' },
  { code: 'so', label: 'Somali', flag: '🇸🇴' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'su', label: 'Sundanese', flag: '🇮🇩' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
  { code: 'tg', label: 'Tajik', flag: '🇹🇯' },
  { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', flag: '🇮🇳' },
  { code: 'th', label: 'Thai', flag: '🇹🇭' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ur', label: 'Urdu', flag: '🇵🇰' },
  { code: 'uz', label: 'Uzbek', flag: '🇺🇿' },
  { code: 'vi', label: 'Vietnamese', flag: '🇻🇳' },
  { code: 'cy', label: 'Welsh', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'xh', label: 'Xhosa', flag: '🇿🇦' },
  { code: 'yi', label: 'Yiddish', flag: '🇪🇺' },
  { code: 'yo', label: 'Yoruba', flag: '🇳🇬' },
  { code: 'zu', label: 'Zulu', flag: '🇿🇦' },
];

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [isAutoTranslateEnabled, setIsAutoTranslateEnabledState] = useState(false);
  const [targetLanguage, setTargetLanguageState] = useState<string | null>(null);
  const [isTargetLanguageSet, setIsTargetLanguageSet] = useState(false);
  const [cache, setCache] = useState<TranslationCache>({});
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modal State
  const [pendingTextToTranslate, setPendingTextToTranslate] = useState<string | null>(null);

  const { presentIOSTranslateSheet, isSupported } = useIOSTranslateSheet();

  // Initial Load - ONLY ONCE
  useEffect(() => {
    const init = async () => {
      try {
        const [config, storedTargetLang] = await Promise.all([
          AsyncStorage.getItem(TRANSLATION_CONFIG_KEY),
          AsyncStorage.getItem(TRANSLATION_TARGET_LANG_KEY),
        ]);

        if (config !== null) {
          setIsAutoTranslateEnabledState(config === 'true');
        }

        if (storedTargetLang !== null) {
          setTargetLanguageState(storedTargetLang);
          setIsTargetLanguageSet(true);
        }
      } catch (e) {
        console.error('Failed to init translation config', e);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  // Cache Loading Effect - Runs whenever language/target changes
  useEffect(() => {
    if (!isLoaded) return;
    
    // Clear cache immediately in UI memory to prevent showing stale language
    setCache({});
    
    let isCancelled = false;
    const loadCache = async () => {
      const activeLang = targetLanguage || language;
      try {
        const storedCache = await AsyncStorage.getItem(`${TRANSLATION_CACHE_KEY_PREFIX}${activeLang}`);
        if (isCancelled) return;
        
        if (storedCache !== null) {
          setCache(JSON.parse(storedCache));
        } else {
          setCache({});
        }
      } catch (e) {
        console.error('Failed to load cache', e);
        if (!isCancelled) setCache({});
      }
    };

    loadCache();
    return () => { isCancelled = true; };
  }, [language, targetLanguage, isLoaded]);

  const setIsAutoTranslateEnabled = async (enabled: boolean) => {
    setIsAutoTranslateEnabledState(enabled);
    try {
      await AsyncStorage.setItem(TRANSLATION_CONFIG_KEY, enabled.toString());
    } catch (e) {
      console.error('Failed to save translation config', e);
    }
  };

  const setTargetLanguage = async (lang: string | null) => {
    setTargetLanguageState(lang);
    try {
      if (lang) {
        await AsyncStorage.setItem(TRANSLATION_TARGET_LANG_KEY, lang);
        setIsTargetLanguageSet(true);
      } else {
        await AsyncStorage.removeItem(TRANSLATION_TARGET_LANG_KEY);
        setIsTargetLanguageSet(false);
      }
    } catch (e) {
      console.error('Failed to save target language', e);
    }
  };



  const cacheTranslation = async (original: string, translated: string) => {
    if (!original || !translated || original === translated) return;

    setCache(prevCache => {
      const newCache = { ...prevCache, [original]: translated };
      
      const activeLang = targetLanguage || language;
      AsyncStorage.setItem(
        `${TRANSLATION_CACHE_KEY_PREFIX}${activeLang}`,
        JSON.stringify(newCache)
      ).catch(e => console.error('Failed to save translation to cache', e));

      return newCache;
    });
  };

  const pendingTranslations = useRef<Set<string>>(new Set());

  const queueTranslation = async (text: string | null | undefined, forceLang?: string): Promise<boolean> => {
    if (!text || text.trim() === '') return false;
    // Auto translate skips if not enabled (unless manual force)
    if (!forceLang && !isAutoTranslateEnabled) return false;
    
    if (pendingTranslations.current.has(text)) return false;
    pendingTranslations.current.add(text);

    // Prefer explicitly provided language, then target settings, then fallback to global app language settings
    const langToUse = forceLang || language;

    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langToUse}&dt=t&q=${encodeURIComponent(text)}`);
      
      if (!response.ok) {
          throw new Error(`Google API returned ${response.status}`);
      }
      
      const result = await response.json();
      
      let translatedText = '';
      if (result && result[0]) {
          result[0].forEach((item: any) => {
              if (item[0]) translatedText += item[0];
          });
      }

      if (translatedText && translatedText !== text) {
          cacheTranslation(text, translatedText);
          return true;
      }
      return false;
    } catch (e) {
      console.warn('Auto translation background fetch failed:', e);
      return false; // Failed
    } finally {
      pendingTranslations.current.delete(text);
    }
  };

  const requireTranslation = async (text: string | null | undefined) => {
    if (!text || text.trim() === '') return;

    // Try Google API silent background first
    const success = await queueTranslation(text, targetLanguage || language);

    // If we completely failed to get a translation, seamlessly fallback to Apple Translate
    if (!success && isSupported) {
      Alert.alert("API Busy", "Using offline Apple Translator...", [{ text: "OK" }]);

      presentIOSTranslateSheet({
        text: text,
        replacementAction: (translatedText: string) => {
          cacheTranslation(text, translatedText);
        }
      });
    } else if (!success) {
      Alert.alert('Translation failed', 'Please try again later or check your connection.');
    }
  };



  const translateText = (text: string | null | undefined, force: boolean = false): string => {
    if (!text) return text || '';

    // 1. Check strings.ts first (priority)
    const enStrings = allStrings.en;
    const key = Object.keys(enStrings).find(k => (enStrings as any)[k] === text);
    if (key) {
      return (allStrings[language] as any)[key] || text;
    }

    // 2. Dynamic content translation
    // Master toggle is isAutoTranslateEnabled. If OFF, return original text (unless forced)
    if (!isAutoTranslateEnabled && !force) return text;

    // 3. Return cache if it exists
    if (cache[text as string]) return cache[text as string];
    
    // 4. If translation is enabled and we haven't fetched it yet, queue it
    const activeTargetLang = targetLanguage || language;
    queueTranslation(text, activeTargetLang);

    return text;
  };

  const clearCache = async () => {
    setCache({});
    const activeLang = targetLanguage || language;
    try {
      await AsyncStorage.removeItem(`${TRANSLATION_CACHE_KEY_PREFIX}${activeLang}`);
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
        forceTranslate: queueTranslation,
        requireTranslation,
        targetLanguage: targetLanguage || language,
        isTargetLanguageSet,
        setTargetLanguage,
        clearCache
      }}
    >
      {children}
      

    </TranslationContext.Provider>
  );
};

const styles = StyleSheet.create({
    languageGridContainer: {
        paddingTop: 16,
        paddingBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
    },
    languageOption: {
        width: '48%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
    },
});

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
