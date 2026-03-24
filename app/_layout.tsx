import { GlobalErrorBoundary } from '@/src/components/common/GlobalErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';

import { MainLayout } from '@/src/components/common/MainLayout';
import { GlobalProvider } from '@/src/context/GlobalProvider';
import React from 'react';
export { GlobalErrorBoundary as ErrorBoundary };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    return (
        <GlobalProvider>
            <MainLayout />
        </GlobalProvider>
    );
}
