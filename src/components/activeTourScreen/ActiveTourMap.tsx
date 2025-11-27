import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../context/ThemeContext';

interface ActiveTourMapProps {
    currentStop: {
        latitude: number;
        longitude: number;
        name: string;
    };
    onNavigate: () => void;
}

export default function ActiveTourMap({ currentStop, onNavigate }: ActiveTourMapProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: currentStop.latitude,
                    longitude: currentStop.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
            >
                <Marker
                    coordinate={{ latitude: currentStop.latitude, longitude: currentStop.longitude }}
                    title={currentStop.name}
                />
            </MapView>
            <TouchableOpacity style={[styles.navigateButton, { backgroundColor: theme.bgSecondary }]} onPress={onNavigate}>
                <Ionicons name="navigate" size={20} color={theme.primary} />
                <Text style={[styles.navigateText, { color: theme.primary }]}>Navigate</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    navigateButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    navigateText: {
        fontWeight: 'bold',
    },
});
