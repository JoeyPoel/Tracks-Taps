import AuthRequiredModal from '@/src/components/AuthRequiredModal';
import ThemedStatusBar from '@/src/components/ThemedStatusBar';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { LanguageProvider } from '@/src/context/LanguageContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { UserProvider } from '@/src/context/UserContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function AuthenticatedLayout() {
    const { session, loading } = useAuth();
    const segment = useSegments();
    const router = useRouter();

    const [isReady, setIsReady] = React.useState(false);
    const [hasSeenOnboarding, setHasSeenOnboarding] = React.useState(false);

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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <LanguageProvider>
            <ThemeProvider>
                <UserProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="auth" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="tour" options={{ headerShown: false }} />
                    </Stack>
                    <ThemedStatusBar />
                    <AuthRequiredModal />
                </UserProvider>
            </ThemeProvider>
        </LanguageProvider>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AuthenticatedLayout />
        </AuthProvider>
    );
}
