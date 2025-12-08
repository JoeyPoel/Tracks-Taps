import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { routingService } from '../../services/routingService';
import { StopType } from '../../types/models';
import { getStopIcon } from '../../utils/stopIcons';

interface StopLocation {
    latitude: number;
    longitude: number;
    name: string;
    type: StopType;
    id: number;
}

interface ActiveTourMapProps {
    currentStop: StopLocation;
    previousStop?: StopLocation;
    onNavigate: () => void;
}

export default function ActiveTourMap({ currentStop, previousStop, onNavigate }: ActiveTourMapProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [route, setRoute] = useState<{ coords: LatLng[], type: 'WALKING' | 'DIRECT' } | null>(null);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        if (previousStop) {
            // Initial straight line (immediate feedback)
            setRoute({
                coords: [
                    { latitude: previousStop.latitude, longitude: previousStop.longitude },
                    { latitude: currentStop.latitude, longitude: currentStop.longitude }
                ],
                type: 'DIRECT'
            });

            // Fetch walking route in background
            const fetchRoute = async () => {
                const start = { latitude: previousStop.latitude, longitude: previousStop.longitude };
                const end = { latitude: currentStop.latitude, longitude: currentStop.longitude };

                const result = await routingService.getWalkingRoute(start, end);
                setRoute(result);
            };
            fetchRoute();

            // Zoom to fit both markers
            setTimeout(() => {
                mapRef.current?.fitToCoordinates([
                    { latitude: previousStop.latitude, longitude: previousStop.longitude },
                    { latitude: currentStop.latitude, longitude: currentStop.longitude }
                ], {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true
                });
            }, 100);
        } else {
            setRoute(null);

            // Center on current stop if no previous stop
            mapRef.current?.animateToRegion({
                latitude: currentStop.latitude,
                longitude: currentStop.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        }
    }, [previousStop?.id, currentStop.id]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                showsMyLocationButton={false}
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
                >
                    <View style={[styles.markerContainer, { backgroundColor: theme.bgSecondary }]}>
                        {getStopIcon(currentStop.type, 20, theme.textPrimary)}
                    </View>
                </Marker>

                {/* The Previous Stop Marker (if present) */}
                {previousStop && (
                    <Marker
                        coordinate={{ latitude: previousStop.latitude, longitude: previousStop.longitude }}
                        title={previousStop.name}
                        opacity={0.6}
                    >
                        <View style={[styles.markerContainer, { backgroundColor: theme.bgSecondary, opacity: 0.8 }]}>
                            {getStopIcon(previousStop.type || 'Viewpoint', 20, theme.textSecondary)}
                        </View>
                    </Marker>
                )}

                {/* The Route Line */}
                {route && route.coords.length > 0 && (
                    <Polyline
                        coordinates={route.coords}
                        strokeColor={theme.primary}
                        strokeWidth={3}
                        lineDashPattern={route.type === 'DIRECT' ? [5, 5] : undefined}
                    />
                )}
            </MapView>

            <TouchableOpacity style={[styles.navigateButton, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]} onPress={onNavigate}>
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    navigateText: {
        fontWeight: 'bold',
    },
    markerContainer: {
        padding: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
});