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

type Language = 'en' | 'es' | 'nl' | 'pl' | 'fr' | 'de';

interface TranslationCache {
  [key: string]: string;
}

interface TranslationContextType {
  isAutoTranslateEnabled: boolean;
  setIsAutoTranslateEnabled: (enabled: boolean) => void;
  translateText: (text: string | null | undefined, force?: boolean) => string;
  cacheTranslation: (original: string, translated: string) => void;
  forceTranslate: (text: string | null | undefined, forceLang?: Language) => Promise<boolean>;
  requireTranslation: (text: string | null | undefined) => Promise<void>;
  targetLanguage: Language | null;
  setTargetLanguage: (lang: Language) => Promise<void>;
  clearCache: () => void;
}

const TRANSLATION_CONFIG_KEY = '@app_auto_translate_enabled';
const TRANSLATION_CACHE_KEY_PREFIX = '@app_translation_cache_';
const TRANSLATION_TARGET_LANG_KEY = '@app_target_translate_language';

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const [isAutoTranslateEnabled, setIsAutoTranslateEnabledState] = useState(false);
  const [targetLanguage, setTargetLanguageState] = useState<Language | null>(null);
  const [cache, setCache] = useState<TranslationCache>({});
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingTextToTranslate, setPendingTextToTranslate] = useState<string | null>(null);

  const { presentIOSTranslateSheet, isSupported } = useIOSTranslateSheet();

  // Load configuration and cache for current language
  useEffect(() => {
    const loadData = async () => {
      try {
        const [config, targetLangStr, storedCache] = await Promise.all([
          AsyncStorage.getItem(TRANSLATION_CONFIG_KEY),
          AsyncStorage.getItem(TRANSLATION_TARGET_LANG_KEY),
          AsyncStorage.getItem(`${TRANSLATION_CACHE_KEY_PREFIX}${language}`)
        ]);

        if (config !== null) {
          setIsAutoTranslateEnabledState(config === 'true');
        }

        if (targetLangStr !== null) {
          setTargetLanguageState(targetLangStr as Language);
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

  const setTargetLanguage = async (lang: Language) => {
    setTargetLanguageState(lang);
    try {
      await AsyncStorage.setItem(TRANSLATION_TARGET_LANG_KEY, lang);
    } catch (e) {
      console.error('Failed to save target language', e);
    }
  };

  const cacheTranslation = async (original: string, translated: string) => {
    if (!original || !translated || original === translated) return;

    setCache(prevCache => {
      const newCache = { ...prevCache, [original]: translated };
      
      // Save to AsyncStorage safely without blocking state
      AsyncStorage.setItem(
        `${TRANSLATION_CACHE_KEY_PREFIX}${language}`,
        JSON.stringify(newCache)
      ).catch(e => console.error('Failed to save translation to cache', e));

      return newCache;
    });
  };

  const pendingTranslations = useRef<Set<string>>(new Set());

  const queueTranslation = async (text: string | null | undefined, forceLang?: Language): Promise<boolean> => {
    if (!text || text.trim() === '') return false;
    // Auto translate skips if not enabled (unless manual force)
    if (!forceLang && !isAutoTranslateEnabled) return false;
    
    if (pendingTranslations.current.has(text)) return false;
    pendingTranslations.current.add(text);

    // Prefer explicitly provided language, then target settings, then fallback to global app language settings
    const langToUse = forceLang || targetLanguage || language;

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
      
      if (!targetLanguage) {
          // Trigger first-time language modal picker
          setPendingTextToTranslate(text);
          setIsModalVisible(true);
          return;
      }

      // Try Google API silent background first
      const success = await queueTranslation(text, targetLanguage);
      
      // If we completely failed to get a translation, seamlessly fallback to Apple Translate
      if (!success && isSupported) {
          Alert.alert("API Busy", "Using offline Apple Translator...", [{ text: "OK" }]);
          
          presentIOSTranslateSheet({
              text: text,
              replacementAction: (translatedText) => {
                  cacheTranslation(text, translatedText);
              }
          });
      } else if (!success) {
          Alert.alert('Translation failed', 'Please try again later or check your connection.');
      }
  };

  const handleLanguageModalSelect = async (lang: Language) => {
      await setTargetLanguage(lang);
      setIsModalVisible(false);
      
      if (pendingTextToTranslate) {
          requireTranslation(pendingTextToTranslate);
          setPendingTextToTranslate(null);
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

    // 2. Always return cache if we have it (ensures manual translations always override immediately)
    if (cache[text as string]) return cache[text as string];
    
    // 3. If auto translate is enabled, language is not EN, and we haven't fetched it yet
    if (isAutoTranslateEnabled && language !== 'en') {
      queueTranslation(text);
    }

    return text;
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
        forceTranslate: queueTranslation,
        requireTranslation,
        targetLanguage,
        setTargetLanguage,
        clearCache
      }}
    >
      {children}
      
      <AppModal
        visible={isModalVisible}
        onClose={() => {
            setIsModalVisible(false);
            setPendingTextToTranslate(null);
        }}
        title="Translate to..."
        subtitle="Select the language you want to translate active tours into. You can change this later."
        height={380}
      >
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.languageGridContainer}
        >
            <View style={styles.grid}>
                {SUPPORTED_LANGUAGES.map((lang, index) => {
                    const isActive = targetLanguage === lang.code;
                    return (
                        <AnimatedPressable
                            key={lang.code}
                            onPress={() => handleLanguageModalSelect(lang.code as Language)}
                            style={[
                                styles.languageOption,
                                {
                                    backgroundColor: isActive ? theme.primary + '15' : theme.bgSecondary,
                                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                                    borderWidth: 1.5
                                }
                            ]}
                        >
                            <TextComponent style={{ fontSize: 28, marginBottom: 8 }}>{lang.flag}</TextComponent>
                            <TextComponent
                                color={isActive ? theme.primary : theme.textPrimary}
                                bold={isActive}
                                variant="body"
                            >
                                {lang.label}
                            </TextComponent>
                        </AnimatedPressable>
                    );
                })}
            </View>
        </ScrollView>
      </AppModal>
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
