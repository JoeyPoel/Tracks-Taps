import { Stack } from 'expo-router';

export default function MapStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="tour/[id]" />
        </Stack>
    );
}
