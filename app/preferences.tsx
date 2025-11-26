import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import AppPreferencesScreen from '@/src/screens/AppPreferencesScreen';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PreferencesRoute() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <AppHeader
                showBackButton={true}
                onBackPress={() => router.back()}
            />
            <AppPreferencesScreen />
        </SafeAreaView>
    );
}
