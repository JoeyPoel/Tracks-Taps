import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { RevenueCatProvider } from './RevenueCatContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';
import { TutorialProvider } from './TutorialContext';
import { UserProvider } from './UserContext';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
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
