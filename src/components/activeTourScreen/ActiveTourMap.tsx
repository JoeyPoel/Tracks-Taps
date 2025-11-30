import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface StopLocation {
    latitude: number;
    longitude: number;
    name: string;
}

interface ActiveTourMapProps {
    currentStop: StopLocation;
    previousStop?: StopLocation;
    onNavigate: () => void;
}

export default function ActiveTourMap({ currentStop, previousStop, onNavigate }: ActiveTourMapProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        if (previousStop) {
            // Without API key we draw a direct line (as the crow flies)
            // This connects point A directly to point B without considering roads
            setRouteCoords([
                { latitude: previousStop.latitude, longitude: previousStop.longitude },
                { latitude: currentStop.latitude, longitude: currentStop.longitude }
            ]);

            // Zoom to fit both markers
            setTimeout(() => {
                mapRef.current?.fitToCoordinates([
                    { latitude: previousStop.latitude, longitude: previousStop.longitude },
                    { latitude: currentStop.latitude, longitude: currentStop.longitude }
                ], {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }, 100);
        } else {
            setRouteCoords([]);

            // Center on current stop if no previous stop
            mapRef.current?.animateToRegion({
                latitude: currentStop.latitude,
                longitude: currentStop.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        }
    }, [previousStop, currentStop]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: currentStop.latitude,
                    longitude: currentStop.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                }}
            >
                {/* The Current Stop Marker */}
                <Marker
                    coordinate={{ latitude: currentStop.latitude, longitude: currentStop.longitude }}
                    title={currentStop.name}
                    pinColor={theme.primary}
                />

                {/* The Previous Stop Marker (if present) */}
                {previousStop && (
                    <Marker
                        coordinate={{ latitude: previousStop.latitude, longitude: previousStop.longitude }}
                        title={previousStop.name}
                        pinColor={theme.secondary}
                        opacity={0.6}
                    />
                )}

                {/* The Route Line (Straight line) */}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor={theme.primary}
                        strokeWidth={3}
                        lineDashPattern={[5, 5]}
                    />
                )}
            </MapView>

            <TouchableOpacity style={[styles.navigateButton, { backgroundColor: theme.bgSecondary }]} onPress={onNavigate}>
                <Ionicons name="navigate" size={20} color={theme.primary} />
                <Text style={[styles.navigateText, { color: theme.primary }]}>{t('navigate')}</Text>
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    navigateText: {
        fontWeight: 'bold',
    },
});