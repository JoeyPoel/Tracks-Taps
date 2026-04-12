import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '../store/store';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { TranslationProvider } from './TranslationContext';
import { RevenueCatProvider } from './RevenueCatContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { TutorialProvider } from './TutorialContext';
import { UserProvider } from './UserContext';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const hasHydrated = useStore((state) => state._hasHydrated);
    const systemScheme = useColorScheme();
    const isDark = systemScheme === 'dark';

    if (!hasHydrated) {
        return (
            <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: isDark ? '#0F172A' : '#F8FAFC' 
            }}>
                <ActivityIndicator size="large" color={isDark ? '#E91E63' : '#E91E63'} />
            </View>
        );
    }

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
                                            {children}
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
