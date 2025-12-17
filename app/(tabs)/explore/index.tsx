import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import ExploreScreen from '@/src/screens/ExploreScreen';
import { View } from 'react-native';

export default function ExploreTab() {
    const { theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <AppHeader />
            <ExploreScreen />
        </View>
    );
}
