import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import ProfileScreen from '@/src/screens/ProfileScreen';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Cog6ToothIcon } from 'react-native-heroicons/outline';

export default function ProfileTab() {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <AppHeader
                rightIcon={<Cog6ToothIcon size={24} color={theme.textPrimary} />}
                onRightIconPress={() => router.push('/profile/preferences')}
            />
            <ProfileScreen />
        </View>
    );
}
