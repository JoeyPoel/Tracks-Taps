import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemedStatusBar() {
    const { mode } = useTheme();

    return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}
