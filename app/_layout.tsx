import { GlobalErrorBoundary } from '@/src/components/common/GlobalErrorBoundary';
import * as SplashScreen from 'expo-splash-screen';

import { MainLayout } from '@/src/components/common/MainLayout';
import { TranslateSheetWrapper } from '@/src/components/common/TranslateSheetWrapper';
import { GlobalProvider } from '@/src/context/GlobalProvider';
import React, { useEffect } from 'react';
import { useFonts } from 'expo-font';

export { GlobalErrorBoundary as ErrorBoundary };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'OpenDyslexic': require('../assets/fonts/OpenDyslexic-Regular.otf'),
    });

    useEffect(() => {
        if (error) {
            console.error("Error loading OpenDyslexic font:", error);
        }
    }, [error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <TranslateSheetWrapper>
            <GlobalProvider>
                <MainLayout />
            </GlobalProvider>
        </TranslateSheetWrapper>
    );
}
