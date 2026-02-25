import { Stack } from 'expo-router';

export default function ProfileStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="preferences" />
            <Stack.Screen name="personal-info" />
            <Stack.Screen name="friend-profile" />
            <Stack.Screen name="friends" />
            <Stack.Screen name="tours-done" />
            <Stack.Screen name="tours-created" />
            <Stack.Screen name="faq" />
            <Stack.Screen name="terms" />
        </Stack>
    );
}
