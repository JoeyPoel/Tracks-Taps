import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useTheme } from '@/src/context/ThemeContext';
import { StopType } from '@/src/types/models';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Define Region type locally to avoid importing from react-native-maps
interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

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

    return (
        <View style={styles.mapContainer}>
            <View style={[styles.placeholder, { backgroundColor: theme.bgSecondary }]}>
                <TextComponent style={styles.text} color={theme.textSecondary} bold variant="body" center>
                    Map selection is not available on web.
                </TextComponent>
                <TextComponent style={styles.subText} color={theme.textSecondary} variant="caption" center>
                    Please use the mobile app to set locations.
                </TextComponent>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        height: '40%',
        width: '100%',
        position: 'relative',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 20,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subText: {
        fontSize: 14,
        textAlign: 'center',
    },
});
