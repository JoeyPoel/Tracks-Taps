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
