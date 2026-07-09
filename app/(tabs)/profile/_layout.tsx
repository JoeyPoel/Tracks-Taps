import { Stack } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';

export default function ProfileStack() {
    const { theme } = useTheme();
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bgPrimary } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="preferences" />
            <Stack.Screen name="personal-info" />
            <Stack.Screen name="admin-panel" />
            <Stack.Screen name="friend-profile" />
            <Stack.Screen name="friends" />
            <Stack.Screen name="tours-done" />
            <Stack.Screen name="tours-created" />
            <Stack.Screen name="faq" />
            <Stack.Screen name="terms" />
        </Stack>
    );
}
