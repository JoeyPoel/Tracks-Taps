import { LanguageProvider } from '@/src/context/LanguageContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { Slot } from 'expo-router';
import React from 'react';

export default function RootLayout() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <Slot />
            </ThemeProvider>
        </LanguageProvider>
    );
}
