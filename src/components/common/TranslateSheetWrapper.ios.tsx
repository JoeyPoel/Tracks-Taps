import React from 'react';
import { IOSTranslateSheetProvider } from 'react-native-ios-translate-sheet';

/**
 * iOS-specific wrapper for TranslateSheetProvider.
 * This is only bundled on iOS platforms.
 */
export const TranslateSheetWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <IOSTranslateSheetProvider>
            {children}
        </IOSTranslateSheetProvider>
    );
};
