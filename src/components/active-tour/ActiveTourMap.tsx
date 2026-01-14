import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ArrowsPointingOutIcon } from 'react-native-heroicons/outline';
import MapView, { LatLng, Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { routingService } from '../../services/routingService';
import { StopType } from '../../types/models';
import { getStopIcon } from '../../utils/stopIcons';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { TextComponent } from '../common/TextComponent';

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
}

export default function ActiveTourMap({ currentStop, previousStop }: ActiveTourMapProps) {
    const { theme, mode } = useTheme();
    const { t } = useLanguage();
    const insets = useSafeAreaInsets();

    const [isFullScreen, setIsFullScreen] = useState(false);
    const [previewRoute, setPreviewRoute] = useState<{ coords: LatLng[], type: 'WALKING' | 'DIRECT' } | null>(null);
    const [navigationRoute, setNavigationRoute] = useState<{ coords: LatLng[], type: 'WALKING' | 'DIRECT' } | null>(null);
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

    const mapRef = useRef<MapView>(null);
    const fullScreenMapRef = useRef<MapView>(null);

    // Initial Preview Route (Stop A -> Stop B)
    useEffect(() => {
        if (previousStop) {
            // Initial straight line
            setPreviewRoute({
                coords: [
                    { latitude: previousStop.latitude, longitude: previousStop.longitude },
                    { latitude: currentStop.latitude, longitude: currentStop.longitude }
                ],
                type: 'DIRECT'
            });

            const fetchRoute = async () => {
                const start = { latitude: previousStop.latitude, longitude: previousStop.longitude };
                const end = { latitude: currentStop.latitude, longitude: currentStop.longitude };
                const result = await routingService.getWalkingRoute(start, end);
                setPreviewRoute(result);
            };
            fetchRoute();

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
            setPreviewRoute(null);
            mapRef.current?.animateToRegion({
                latitude: currentStop.latitude,
                longitude: currentStop.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        }
    }, [previousStop?.id, currentStop.id]);

    // Full Screen Logic: Get User Location & Route (User -> Stop B)
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;
        let lastRouteUpdate = 0;

        const startNavigation = async () => {
            if (!isFullScreen) return;

            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);

            if (status !== 'granted') {
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const userLatLng = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            setUserLocation(userLatLng);

            // Initial fetch of walking route from User -> Destination
            const result = await routingService.getWalkingRoute(userLatLng, { latitude: currentStop.latitude, longitude: currentStop.longitude });
            setNavigationRoute(result);
            lastRouteUpdate = Date.now();

            // Fit to show user and destination
            setTimeout(() => {
                fullScreenMapRef.current?.fitToCoordinates([
                    userLatLng,
                    { latitude: currentStop.latitude, longitude: currentStop.longitude }
                ], {
                    edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                    animated: true
                });
            }, 500);

            // Subscribe to updates AND update route periodically
            subscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                async (newLoc) => {
                    const newLatLng = { latitude: newLoc.coords.latitude, longitude: newLoc.coords.longitude };
                    setUserLocation(newLatLng);

                    // Update route every 15 seconds if moved
                    const now = Date.now();
                    if (now - lastRouteUpdate > 15000) {
                        lastRouteUpdate = now;
                        const newRoute = await routingService.getWalkingRoute(newLatLng, { latitude: currentStop.latitude, longitude: currentStop.longitude });
                        setNavigationRoute(newRoute);
                    }
                }
            );
        };

        if (isFullScreen) {
            startNavigation();
        }

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, [isFullScreen, currentStop.id]);

    const handleExternalNavigation = () => {
        const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
        const lat = currentStop.latitude;
        const lng = currentStop.longitude;
        const label = encodeURIComponent(currentStop.name);

        const url = Platform.select({
            ios: `${scheme}?daddr=${lat},${lng}&dirflg=w`, // dirflg=w for walking
            android: `${scheme}0,0?q=${lat},${lng}(${label})`
        });

        if (url) {
            Linking.openURL(url);
        }
    };


    return (
        <>
            {/* Small Preview Map */}
            <View style={styles.container}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    userInterfaceStyle={mode}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    initialRegion={{
                        latitude: currentStop.latitude,
                        longitude: currentStop.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                >
                    <Marker
                        coordinate={{ latitude: currentStop.latitude, longitude: currentStop.longitude }}
                        title={currentStop.name}
                    >
                        <View style={[styles.markerContainer, { backgroundColor: theme.bgSecondary }]}>
                            {getStopIcon(currentStop.type, 20, theme.textPrimary)}
                        </View>
                    </Marker>

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

                    {previewRoute && previewRoute.coords.length > 0 && (
                        <Polyline
                            coordinates={previewRoute.coords}
                            strokeColor={theme.primary}
                            strokeWidth={3}
                            lineDashPattern={previewRoute.type === 'DIRECT' ? [5, 5] : undefined}
                        />
                    )}
                </MapView>

                {/* Expand Button - White Background */}
                <AnimatedPressable
                    style={[styles.expandButton, { backgroundColor: theme.bgPrimary, shadowColor: theme.shadowColor }]}
                    onPress={() => setIsFullScreen(true)}
                    interactionScale="subtle"
                    haptic="selection"
                >
                    <ArrowsPointingOutIcon size={20} color={theme.textPrimary} />
                </AnimatedPressable>
            </View>

            {/* Full Screen Modal */}
            <Modal
                visible={isFullScreen}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setIsFullScreen(false)}
            >
                <View style={[styles.fullScreenContainer, { backgroundColor: theme.bgPrimary }]}>
                    <MapView
                        ref={fullScreenMapRef}
                        style={styles.fullScreenMap}
                        userInterfaceStyle={mode}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        initialRegion={{
                            latitude: currentStop.latitude,
                            longitude: currentStop.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                    >
                        {/* Destination Marker */}
                        <Marker
                            coordinate={{ latitude: currentStop.latitude, longitude: currentStop.longitude }}
                            title={currentStop.name}
                        >
                            <View style={[styles.markerContainer, { backgroundColor: theme.bgSecondary, transform: [{ scale: 1.2 }] }]}>
                                {getStopIcon(currentStop.type, 24, theme.textPrimary)}
                            </View>
                        </Marker>

                        {/* Navigation Route from User -> Destination */}
                        {navigationRoute && navigationRoute.coords.length > 0 && (
                            <Polyline
                                coordinates={navigationRoute.coords}
                                strokeColor={theme.primary}
                                strokeWidth={4}
                                lineDashPattern={navigationRoute.type === 'DIRECT' ? [5, 5] : undefined}
                            />
                        )}
                    </MapView>

                    {/* Top Bar / Back Button */}
                    <View style={[styles.topBar, { top: insets.top + 10 }]}>
                        <TouchableOpacity
                            onPress={() => setIsFullScreen(false)}
                            style={styles.backButton}
                        >
                            <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
                                <Ionicons name="arrow-back" size={24} color="#FFF" />
                            </BlurView>
                        </TouchableOpacity>
                    </View>

                    {/* External Navigation Button */}
                    <TouchableOpacity
                        style={[styles.externalNavButton, { backgroundColor: theme.primary, top: insets.top + 10 }]}
                        onPress={handleExternalNavigation}
                    >
                        <Ionicons name="navigate" size={20} color="white" />
                        <TextComponent style={styles.externalNavText} color="white" bold>{t('navigate')}</TextComponent>
                    </TouchableOpacity>

                </View>
            </Modal>
        </>
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
    expandButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
    },
    expandText: {
        fontWeight: 'bold',
        fontSize: 14,
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
    // Full Screen Styles
    fullScreenContainer: {
        flex: 1,
    },
    fullScreenMap: {
        width: '100%',
        height: '100%',
    },
    topBar: {
        position: 'absolute',
        left: 20,
    },
    backButton: {
        borderRadius: 22,
        overflow: 'hidden',
    },
    backButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    externalNavButton: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    externalNavText: {
        fontWeight: 'bold',
        fontSize: 16,
    }
});