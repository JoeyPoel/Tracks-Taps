import { GlobalErrorBoundary } from '@/src/components/common/GlobalErrorBoundary';
export { GlobalErrorBoundary as ErrorBoundary };

import { MainLayout } from '@/src/components/common/MainLayout';
import { GlobalProvider } from '@/src/context/GlobalProvider';
import React from 'react';

export default function RootLayout() {
    return (
        <GlobalProvider>
            <MainLayout />
        </GlobalProvider>
    );
}
