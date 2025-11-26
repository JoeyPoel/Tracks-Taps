import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import MapScreen from '@/src/screens/MapScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapTab() {
    const { theme } = useTheme();

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <AppHeader />
            <MapScreen />
        </SafeAreaView>
    );
}
