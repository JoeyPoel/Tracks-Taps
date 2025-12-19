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

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segment[0] === 'auth';

        // If user is validated and tries to access auth pages, redirect to home
        if (session && inAuthGroup) {
            router.replace('/');
        } else if (!session && !inAuthGroup) {
            // Redirect unauthenticated users to login
            router.replace('/auth/login');
        }
    }, [session, loading, segment]);

    if (loading) {
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
