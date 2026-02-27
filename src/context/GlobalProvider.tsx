import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useStore } from '../store/store';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { RevenueCatProvider } from './RevenueCatContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { TutorialProvider } from './TutorialContext';
import { UserProvider } from './UserContext';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const hasHydrated = useStore((state) => state._hasHydrated);

    if (!hasHydrated) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <LanguageProvider>
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
                </LanguageProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
