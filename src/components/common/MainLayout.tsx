import AuthRequiredModal from '@/src/components/AuthRequiredModal';
import ThemedStatusBar from '@/src/components/ThemedStatusBar';
import { useAuth } from '@/src/context/AuthContext';
import { useLevelUpListener } from '@/src/hooks/useLevelUpListener';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function MainLayout() {
    const { session, loading } = useAuth();
    const { theme } = useTheme();
    const segment = useSegments();
    const router = useRouter();

    const [isReady, setIsReady] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    // Listen for level ups
    useLevelUpListener();

    useEffect(() => {
        // Check onboarding status
        const checkOnboarding = async () => {
            // const value = await AsyncStorage.getItem('hasSeenOnboarding');
            // setHasSeenOnboarding(value === 'true');
            setHasSeenOnboarding(false);
            setIsReady(true);
        };
        checkOnboarding();
    }, []);

    useEffect(() => {
        if (loading || !isReady) return;

        const inAuthGroup = segment[0] === 'auth';

        if (session) {
            // If authenticated, go to home (unless already there, but Replace covers this)
            if (inAuthGroup) {
                router.replace('/');
            }
        } else {
            // Not authenticated
            if (!inAuthGroup) {
                // Initial redirect logic
                if (!hasSeenOnboarding) {
                    router.replace('/auth/onboarding' as any);
                } else {
                    router.replace('/auth/login');
                }
            } else if (segment[1] === 'login' && !hasSeenOnboarding) {
                // Guard: If trying to access login but hasn't seen onboarding, redirect back
                // This protects against deep links or manual navigation to /auth/login
                // router.replace('/auth/onboarding' as any);
            }
        }
    }, [session, loading, isReady, segment, hasSeenOnboarding]);

    if (!isReady || loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bgPrimary }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bgPrimary } }}>
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="tour" options={{ headerShown: false }} />
            </Stack>
            <ThemedStatusBar />
            <AuthRequiredModal />
        </>
    );
}
