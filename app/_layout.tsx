import { LanguageProvider } from '@/src/context/LanguageContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <Stack screenOptions={{ headerShown: false }}>
                </Stack>
            </ThemeProvider>
        </LanguageProvider>
    );
}
