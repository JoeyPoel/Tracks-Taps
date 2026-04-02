import { useIOSTranslateSheet as useIOSTranslateSheetNative } from 'react-native-ios-translate-sheet';

/**
 * iOS-specific version of the hook.
 */
export const useIOSTranslateSheet = () => {
    return useIOSTranslateSheetNative();
};
