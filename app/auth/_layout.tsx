import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="forgot-password" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="confirm-email" />
            <Stack.Screen name="link-expired" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="terms" />
        </Stack>
    );
}
