import { Stack } from 'expo-router';
import { useTheme } from '@/src/context/ThemeContext';

export default function ExploreStack() {
    const { theme } = useTheme();
    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bgPrimary } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="tour/[id]" />
        </Stack>
    );
}
