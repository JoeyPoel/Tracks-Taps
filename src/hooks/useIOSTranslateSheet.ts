/**
 * Mock version for non-iOS platforms (Android, Web, SSR) that returns a safe-to-call object.
 */
export const useIOSTranslateSheet = () => {
    return {
        isSupported: false,
        presentIOSTranslateSheet: (_options: { text: string; replacementAction: (text: string) => void }) => {
            console.warn('iOS Translate Sheet is only available on iOS devices.');
        }
    };
};
