import AuthRequiredModal from '@/src/components/AuthRequiredModal';
import ThemedStatusBar from '@/src/components/ThemedStatusBar';
import { ThemeOverlay } from '@/src/components/common/ThemeOverlay';
import { TutorialOverlay } from '@/src/components/tutorial/TutorialOverlay';
import { useAuth } from '@/src/context/AuthContext';
import { useTutorial } from '@/src/context/TutorialContext';
import { getAppMaxWidth } from '@/src/hooks/useAppWidth';
import { useLevelUpListener } from '@/src/hooks/useLevelUpListener';
import { supabase } from '@/utils/supabase';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../store/store';
import { Image } from 'expo-image';

export function MainLayout() {
    const { session, loading: authLoading } = useAuth();
    const { theme, mode, overlayTrigger, overlayType } = useTheme();
    const segment = useSegments();
    const router = useRouter();
    const hasHydrated = useStore((state) => state._hasHydrated);
    const user = useStore((state) => state.user);

    const [isReady, setIsReady] = useState(false);
    const [isHandlingAuthRedirect, setIsHandlingAuthRedirect] = useState(false);
    const [authTimeout, setAuthTimeout] = useState(false);

    const { hasSeenTutorial, isLoading: isTutorialLoading, startTutorial, isActive, resetTutorial } = useTutorial();

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
                                setIsHandlingAuthRedirect(true);
                                router.replace(route);
                                setIsReady(true);
                                return;
                            }
                        }
                        // Handle Errors (link expired)
                        else if (params.get('error')) {
                            const errorCode = params.get('error_code');
                            const errorDescription = params.get('error_description');

                            console.log("Link Expired detected:", errorCode, errorDescription);

                            setIsHandlingAuthRedirect(true);

                            // Use setTimeout to ensure state update propagates before navigation
                            setTimeout(() => {
                                router.replace({
                                    pathname: '/auth/link-expired',
                                    params: {
                                        error_description: errorDescription?.replace(/\+/g, ' ') || '',
                                        code: errorCode || ''
                                    }
                                });
                                setIsReady(true);
                            }, 100);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Error parsing auth hash:", e);
                }
            }

            // Fallthrough default
            setIsReady(true);
        };
        checkInitialState();
    }, []);

    // Safety timeout for auth loading (handles offline hangs)
    useEffect(() => {
        if (authLoading && !authTimeout) {
            const timer = setTimeout(() => {
                console.warn("Auth loading timed out (likely offline). Proceeding...");
                setAuthTimeout(true);
            }, 3000); // 3 seconds timeout
            return () => clearTimeout(timer);
        }
    }, [authLoading, authTimeout]);

    // Calculate effective loading state
    const isLoading = (authLoading && !authTimeout) || !isReady || !hasHydrated;

    // Handle SplashScreen hiding
    useEffect(() => {
        if (!isLoading) {
            // Give the UI one frame to render before hiding splash
            const timer = setTimeout(async () => {
                await SplashScreen.hideAsync().catch(() => {});
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    useEffect(() => {
        if (isLoading) return;

        // If we are handling a specific auth redirect (like link expired), 
        // wait until we land on an auth page before enforcing protection logic.
        if (isHandlingAuthRedirect) {
            const path = segment.join('/');
            // If we've arrived at an auth page (or we are deeply confirming we are in auth segment)
            if (segment[0] === 'auth') {
                // We arrived, allow normal logic to resume (though auth pages are exceptions below anyway)
                setIsHandlingAuthRedirect(false);
            }
            return;
        }

        const inAuthGroup = segment[0] === 'auth';

        if (session) {
            // If authenticated, go to home (unless already there, but Replace covers this)
            // Exception: confirm-email, reset-password, and link-expired should be viewable even if logged in
            const isException = segment[1] === 'confirm-email' || segment[1] === 'reset-password' || (segment[1] as string) === 'link-expired';

            if (inAuthGroup && !isException) {
                router.replace('/');
            }
        }
        // Guest users are allowed in Main Layout (Tabs)
    }, [session, isLoading, segment, isHandlingAuthRedirect]);

    // Handle Tutorial Trigger
    useEffect(() => {
        if (isLoading) return;

        // If the backend flagged this as a new user, force the tutorial to reset and play for this account
        if (user && (user as any).isNewUser) {
            // Unflag the local object so we only do this once
            useStore.setState({ user: { ...user, isNewUser: false } });
            // This clears the device cache
            resetTutorial().then(() => {
                // Wait briefly for smooth transition, then start the wizard immediately
                setTimeout(() => {
                    startTutorial();
                }, 1000);
            });
            return;
        }

        if (!isTutorialLoading && !hasSeenTutorial && !isActive) {
            // Check if we are in the main app (not auth screens)
            const inAuthGroup = segment[0] === 'auth';
            if (!inAuthGroup) {
                const timer = setTimeout(() => {
                    startTutorial();
                }, 1500);
                return () => clearTimeout(timer);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, isTutorialLoading, hasSeenTutorial, isActive, isLoading, segment, user, resetTutorial]);

    if (isLoading) {
        const splashImage = mode === 'dark' 
            ? require('@/assets/images/SplashScreenColouredDarkTheme.png')
            : require('@/assets/images/SplashScreenColouredWhiteTheme.png');

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bgPrimary }}>
                <Image 
                    source={splashImage} 
                    contentFit="contain"
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                />
                <ActivityIndicator 
                    size="large" 
                    color={theme.primary} 
                    style={{ position: 'absolute', bottom: Platform.OS === 'ios' ? 100 : 80 }} 
                />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <View style={{ flex: 1, width: '100%', maxWidth: (segment as string[]).includes('map') ? '100%' : getAppMaxWidth(), alignSelf: 'center' }}>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bgPrimary } }}>
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="tour/[id]" options={{ headerShown: false, gestureEnabled: true, fullScreenGestureEnabled: true }} />
                    <Stack.Screen name="+not-found" />
                </Stack>
                <ThemedStatusBar />
                <AuthRequiredModal />
                <TutorialOverlay />
                <ThemeOverlay trigger={overlayTrigger} type={overlayType} />
            </View>
        </View>
    );
}
