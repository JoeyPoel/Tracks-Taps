import { ErrorView } from '@/src/components/common/ErrorView';
import { Stack, useRouter } from 'expo-router';
import React from 'react';

export default function NotFoundScreen() {
    const router = useRouter();

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
            <ErrorView
                title="Page Not Found"
                message="The page you are looking for doesn't exist or has been moved."
                onAction={() => router.replace('/(tabs)/explore')}
                actionScript="Return to Explore"
            />
        </>
    );
}
