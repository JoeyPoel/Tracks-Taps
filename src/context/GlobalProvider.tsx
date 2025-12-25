import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './AuthContext';
import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import { UserProvider } from './UserContext';

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
                <LanguageProvider>
                    <ThemeProvider>
                        <UserProvider>
                            {children}
                        </UserProvider>
                    </ThemeProvider>
                </LanguageProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
