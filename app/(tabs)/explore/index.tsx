import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import ExploreScreen from '@/src/screens/ExploreScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreTab() {
    const { theme } = useTheme();

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <AppHeader />
            <ExploreScreen />
        </SafeAreaView>
    );
}
