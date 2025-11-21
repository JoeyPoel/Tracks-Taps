import React from 'react';
import AppNavigator from '@/src/navigation/AppNavigator';
import { ThemeProvider } from '@/src/theme/ThemeContext';

export default function Index() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
