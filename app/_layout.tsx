import { LanguageProvider } from '@/src/context/LanguageContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { UserProvider } from '@/src/context/UserContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <UserProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                    </Stack>
                </UserProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}
