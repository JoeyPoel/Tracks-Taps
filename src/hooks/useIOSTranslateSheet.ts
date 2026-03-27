import { useIOSTranslateSheet as useIOSTranslateSheetNative } from 'react-native-ios-translate-sheet';

/**
 * Wrapper for useIOSTranslateSheet that works on mobile.
 */
export const useIOSTranslateSheet = () => {
    return useIOSTranslateSheetNative();
};
