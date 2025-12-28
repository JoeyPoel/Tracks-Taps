import AppHeader from '@/src/components/Header';
import { useTheme } from '@/src/context/ThemeContext';
import MapScreen from '@/src/screens/MapScreen';
import { View } from 'react-native';

export default function MapTab() {
    const { theme } = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            <MapScreen />
        </View>
    );
}
