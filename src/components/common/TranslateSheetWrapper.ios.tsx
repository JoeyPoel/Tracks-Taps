import React from 'react';
import { IOSTranslateSheetProvider } from 'react-native-ios-translate-sheet';

/**
 * iOS-specific wrapper for TranslateSheetProvider.
 * This will only be loaded on iOS, allowing native components to be bundled safely.
 */
export const TranslateSheetWrapper = ({ children }: { children: React.ReactNode }) => {
    return <IOSTranslateSheetProvider>{children}</IOSTranslateSheetProvider>;
};
