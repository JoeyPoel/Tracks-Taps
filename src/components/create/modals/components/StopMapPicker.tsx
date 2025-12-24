import { useTheme } from '@/src/context/ThemeContext';
import { StopType } from '@/src/types/models';
import { getStopIcon } from '@/src/utils/stopIcons';
import React from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';

interface StopMapPickerProps {
    region: Region;
    setRegion: (region: Region) => void;
    marker: { latitude: number; longitude: number } | null;
    setMarker: (marker: { latitude: number; longitude: number } | null) => void;
    existingStops: any[];
    currentStopType?: StopType;
}

export function StopMapPicker({ region, setRegion, marker, setMarker, existingStops, currentStopType = StopType.Viewpoint }: StopMapPickerProps) {
    const { theme } = useTheme();

    const handleMapPress = (e: any) => {
        setMarker(e.nativeEvent.coordinate);
        Keyboard.dismiss();
    };

    const routeCoordinates = [
        ...existingStops.map(s => ({ latitude: s.latitude, longitude: s.longitude })),
        ...(marker ? [marker] : [])
    ];

    return (
        <View style={styles.mapContainer}>
            <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton
            >
                {/* Previous Stops (Ghost Pins) */}
                {existingStops.map((stop, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: stop.latitude, longitude: stop.longitude }}
                        title={`${index + 1}. ${stop.name}`}
                        style={{ opacity: 0.6 }}
                    >
                        <View style={[styles.markerPip, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                            {getStopIcon(stop.type || StopType.Viewpoint, 14, theme.textSecondary)}
                        </View>
                    </Marker>
                ))}

                {/* Route Line */}
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={theme.primary}
                    strokeWidth={3}
                    lineDashPattern={[5, 5]}
                />

                {/* Current Selection */}
                {marker && (
                    <Marker coordinate={marker}>
                        <View style={[styles.markerPip, { backgroundColor: theme.primary, borderColor: 'white', borderWidth: 2 }]}>
                            {getStopIcon(currentStopType, 16, 'white')}
                        </View>
                    </Marker>
                )}
            </MapView>
            {!marker && (
                <View style={styles.mapInstruction}>
                    <Text style={styles.mapInstructionText}>Tap map to set location</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        height: '40%',
        width: '100%',
        position: 'relative',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapInstruction: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    mapInstructionText: {
        color: 'white',
        fontWeight: '600',
    },
    markerPip: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
});
