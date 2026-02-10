import { useTheme } from '@/src/context/ThemeContext';
import ProfileScreen from '@/src/screens/ProfileScreen';
import { View } from 'react-native';

export default function ProfileTab() {
    const { theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <ProfileScreen />
        </View>
    );
}
