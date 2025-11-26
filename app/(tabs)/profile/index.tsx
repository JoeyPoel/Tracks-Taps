import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import ProfileScreen from '@/src/screens/ProfileScreen';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileTab() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <AppHeader
                rightIcon="settings-outline"
                onRightIconPress={() => router.push('/profile/preferences')}
            />
            <ProfileScreen />
        </SafeAreaView>
    );
}
