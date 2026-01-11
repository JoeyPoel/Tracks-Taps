import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { ErrorView } from './ErrorView';

interface Props {
    error: Error;
    retry: () => Promise<void>;
}

export function GlobalErrorBoundary(props: Props) {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <ErrorView
                title="Something went wrong"
                message={
                    props.error instanceof Error
                        ? props.error.message
                        : 'An unexpected application error occurred.'
                }
                onAction={() => {
                    // Try to recover by navigation
                    router.replace('/(tabs)/explore');
                    // optional: props.retry(); 
                }}
                actionScript="Return to Home"
            />
        </View>
    );
}
