import { ErrorView } from '@/src/components/common/ErrorView';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function ErrorScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const title = typeof params.title === 'string' ? params.title : "Something Went Wrong";
    const message = typeof params.message === 'string' ? params.message : "An unexpected issue occurred.";

    return (
        <>
            <Stack.Screen options={{ title: 'Error', headerShown: false }} />
            <ErrorView
                title={title}
                message={message}
                onAction={() => router.replace('/(tabs)/explore')}
                actionScript="Go Home"
            />
        </>
    );
}
