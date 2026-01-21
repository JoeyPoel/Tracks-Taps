import AuthRequiredModal from '@/src/components/AuthRequiredModal';
import ThemedStatusBar from '@/src/components/ThemedStatusBar';
import { useAuth } from '@/src/context/AuthContext';
import { useLevelUpListener } from '@/src/hooks/useLevelUpListener';
import { supabase } from '@/utils/supabase';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function MainLayout() {
    const { session, loading } = useAuth();
    const { theme } = useTheme();
    const segment = useSegments();
    const router = useRouter();

    const [isReady, setIsReady] = useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    // const [initialRedirect, setInitialRedirect] = useState<{ pathname: string; params?: any } | null>(null);

    // Listen for level ups
    useLevelUpListener();

    useEffect(() => {
        const checkInitialState = async () => {
            // Web-specific: Check for hash redirects (Supabase Auth)
            if (Platform.OS === 'web') {
                try {
                    const hash = window.location.hash;
                    if (hash && (hash.includes('access_token') || hash.includes('error'))) {
                        const params = new URLSearchParams(hash.substring(1));

                        // Handle Email Confirmation / Recovery
                        if (params.get('access_token')) {
                            const accessToken = params.get('access_token');
                            const refreshToken = params.get('refresh_token');
                            const type = params.get('type');

                            if (accessToken && refreshToken) {
                                const { error } = await supabase.auth.setSession({
                                    access_token: accessToken,
                                    refresh_token: refreshToken,
                                });
                                if (error) console.error("Error setting session", error);

                                const route = type === 'recovery' ? '/auth/reset-password' : '/auth/confirm-email';
                                // setInitialRedirect({ pathname: route });
                                // On second thought, immediate replace works fine usually, but let's try direct replace 
                                // BUT ensuring we don't block.
                                router.replace(route);
                                setIsReady(true);
                                return;
                            }
                        }
                        // Handle Errors (link expired)
                        else if (params.get('error')) {
                            const errorCode = params.get('error_code');
                            const errorDescription = params.get('error_description');

                            // Log for debugging
                            console.log("Link Expired detected:", errorCode, errorDescription);

                            router.replace({
                                pathname: '/auth/link-expired' as any,
                                params: { error_description: errorDescription || '', code: errorCode || '' }
                            });
                            setIsReady(true);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing auth hash:", e);
                }
            }

            // Fallthrough default
            setHasSeenOnboarding(false);
            setIsReady(true);
        };
        checkInitialState();
    }, []);

    useEffect(() => {
        if (loading || !isReady) return;

        const inAuthGroup = segment[0] === 'auth';

        if (session) {
            // If authenticated, go to home (unless already there, but Replace covers this)
            // Exception: confirm-email, reset-password, and link-expired should be viewable even if logged in
            const isException = segment[1] === 'confirm-email' || segment[1] === 'reset-password' || (segment[1] as string) === 'link-expired';

            if (inAuthGroup && !isException) {
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
                <Stack.Screen name="tour/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <ThemedStatusBar />
            <AuthRequiredModal />
        </>
    );
}
