import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import TourDetailScreen from '@/src/screens/TourDetailScreen';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TourDetailRoute() {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams();
    const tourId = id ? Number(id) : undefined;

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            {tourId && <TourDetailScreen tourId={tourId} />}
        </SafeAreaView>
    );
}
