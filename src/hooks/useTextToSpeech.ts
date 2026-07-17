import { useCallback, useState, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { useStore } from '../store/store';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGE_VOICE_MAP: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    nl: 'nl-NL',
    fr: 'fr-FR',
    de: 'de-DE',
    pl: 'pl-PL'
};

// Global counter to track the active speech session across all hook instances.
// Helps resolve race conditions during React Navigation transitions.
let globalSpeechSessionId = 0;

/**
 * Hook to interface with expo-speech native Text-To-Speech engine.
 * Respects user preferences (narrationMode and speechRate) in the Zustand store.
 */
export function useTextToSpeech() {
    const narrationMode = useStore((state) => state.narrationMode);
    const speechRate = useStore((state) => state.speechRate);
    const { language } = useLanguage();
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Tracks the last session ID initiated by this specific hook instance
    const lastInstanceSessionId = useRef<number>(0);

    // Stop speaking when hook unmounts to prevent audio leaks
    useEffect(() => {
        return () => {
            if (globalSpeechSessionId === lastInstanceSessionId.current) {
                Speech.stop().catch(() => {});
            }
        };
    }, []);

    /**
     * Stop the current speech playback.
     */
    const stop = useCallback(async () => {
        try {
            // Only stop the speech engine if no other screen/component has started speaking
            if (globalSpeechSessionId === lastInstanceSessionId.current) {
                await Speech.stop();
                setIsSpeaking(false);
            }
        } catch (error) {
            console.error('[useTextToSpeech] Error stopping speech:', error);
        }
    }, []);

    /**
     * Narrate text aloud.
     * @param text The text to speak.
     * @param force If true, speaks even if narrationMode is set to 'off'.
     */
    const speak = useCallback(async (text: string, force = false) => {
        if (!text) return;
        
        // Speak only if narration is enabled or forced (e.g. manual press of speaker button)
        if (narrationMode === 'off' && !force) {
            return;
        }

        const sessionId = ++globalSpeechSessionId;
        lastInstanceSessionId.current = sessionId;

        try {
            await Speech.stop();
            setIsSpeaking(true);
            
            const voiceLang = LANGUAGE_VOICE_MAP[language] || 'en-US';
            Speech.speak(text, {
                language: voiceLang,
                rate: speechRate,
                onDone: () => {
                    if (globalSpeechSessionId === sessionId) {
                        setIsSpeaking(false);
                    }
                },
                onError: (e) => {
                    console.error('[useTextToSpeech] Speech error:', e);
                    if (globalSpeechSessionId === sessionId) {
                        setIsSpeaking(false);
                    }
                },
                onStopped: () => {
                    if (globalSpeechSessionId === sessionId) {
                        setIsSpeaking(false);
                    }
                },
            });
        } catch (error) {
            console.error('[useTextToSpeech] Error starting speech:', error);
            setIsSpeaking(false);
        }
    }, [narrationMode, speechRate, language]);

    /**
     * Read aloud entering screen announcement (useful for visually impaired users).
     */
    const speakScreenHeader = useCallback((screenName: string) => {
        if (narrationMode === 'full') {
            speak(`Screen: ${screenName}`);
        }
    }, [narrationMode, speak]);

    return { speak, stop, isSpeaking, speakScreenHeader, narrationMode };
}
