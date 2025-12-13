import { useTheme } from '@/src/context/ThemeContext';
import ActiveTourScreen from '@/src/screens/ActiveTourScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ActiveTourRoute() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const activeTourId = id ? Number(id) : undefined;

    return (
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            {activeTourId && <ActiveTourScreen activeTourId={activeTourId} />}
        </SafeAreaView>
    );
}
