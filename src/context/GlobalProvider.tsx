import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '../store/store';
import { AuthProvider } from '@/src/context/AuthContext';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { TranslationProvider } from '@/src/context/TranslationContext';
import { RevenueCatProvider } from '@/src/context/RevenueCatContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { ToastProvider } from '@/src/context/ToastContext';
import { TutorialProvider } from '@/src/context/TutorialContext';
import { UserProvider } from '@/src/context/UserContext';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const hasHydrated = useStore((state) => state._hasHydrated);
    const systemScheme = useColorScheme();
    const isDark = systemScheme === 'dark';

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <LanguageProvider>
                    <TranslationProvider>
                        <ThemeProvider>
                            <UserProvider>
                                <TutorialProvider>
                                    <RevenueCatProvider>
                                        <ToastProvider>
                                            {!hasHydrated ? (
                                                <View style={{ 
                                                    flex: 1, 
                                                    justifyContent: 'center', 
                                                    alignItems: 'center',
                                                    backgroundColor: isDark ? '#0F172A' : '#F8FAFC' 
                                                }}>
                                                    <ActivityIndicator size="large" color={isDark ? '#E91E63' : '#E91E63'} />
                                                </View>
                                            ) : (
                                                children
                                            )}
                                        </ToastProvider>
                                    </RevenueCatProvider>
                                </TutorialProvider>
                            </UserProvider>
                        </ThemeProvider>
                    </TranslationProvider>
                </LanguageProvider>
            </AuthProvider>
        </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}
