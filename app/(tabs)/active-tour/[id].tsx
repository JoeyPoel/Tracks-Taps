import { useTheme } from '@/src/context/ThemeContext';
import ActiveTourScreen from '@/src/screens/ActiveTourScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function ActiveTourRoute() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const activeTourId = id ? Number(id) : undefined;

    return (
        <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
            {activeTourId && <ActiveTourScreen activeTourId={activeTourId} />}
        </View>
    );
}
