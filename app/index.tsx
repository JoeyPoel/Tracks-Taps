import React from 'react';
import AppNavigator from '../src/navigation/AppNavigator';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { LanguageProvider } from '@/src/context/LanguageContext';

export default function Index() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </LanguageProvider>
  );
}
