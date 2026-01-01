import { useTheme } from '@/src/context/ThemeContext';
import TourDetailScreen from '@/src/screens/TourDetailScreen';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TourDetailRoute() {
    const { theme } = useTheme();
    const { id } = useLocalSearchParams();
    const tourId = id ? Number(id) : undefined;

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            {tourId && <TourDetailScreen tourId={tourId} />}
        </View>
    );
}
