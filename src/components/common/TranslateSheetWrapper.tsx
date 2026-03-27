import React from 'react';
import { Platform } from 'react-native';
import { IOSTranslateSheetProvider } from 'react-native-ios-translate-sheet';

/**
 * Fallback wrapper for TranslateSheetProvider on Web and Android.
 * This prevents importing native iOS modules in unsupported environments.
 */
export const TranslateSheetWrapper = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') {
        return <>{children}</>;
    }
    
    return (
        <IOSTranslateSheetProvider>
            {children}
        </IOSTranslateSheetProvider>
    );
};
