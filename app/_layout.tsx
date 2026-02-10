import { GlobalErrorBoundary } from '@/src/components/common/GlobalErrorBoundary';

import { MainLayout } from '@/src/components/common/MainLayout';
import { GlobalProvider } from '@/src/context/GlobalProvider';
import React from 'react';
export { GlobalErrorBoundary as ErrorBoundary };

export default function RootLayout() {
    return (
        <GlobalProvider>
            <MainLayout />
        </GlobalProvider>
    );
}
