import React from 'react';

/**
 * Fallback wrapper for TranslateSheetProvider on Web and Android.
 * This prevents importing native iOS modules in unsupported environments.
 */
export const TranslateSheetWrapper = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
