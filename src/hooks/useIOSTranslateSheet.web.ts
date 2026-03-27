/**
 * Mock version for web that doesn't trigger the native module error.
 */
export const useIOSTranslateSheet = () => {
    return {
        isSupported: false,
        presentIOSTranslateSheet: () => {
            console.warn('iOS Translate Sheet is only available on iOS devices.');
        }
    };
};
