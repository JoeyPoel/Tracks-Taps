import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { StopType } from '@/src/types/models';
import { getStopIcon } from '@/src/utils/stopIcons';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';

interface StopMapPickerProps {
    region: Region;
    setRegion: (region: Region) => void;
    marker: { latitude: number; longitude: number } | null;
    setMarker: (marker: { latitude: number; longitude: number } | null) => void;
    existingStops: any[];
    currentStopType?: StopType;
    editingIndex?: number | null;
}

interface SearchResult {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
}

export function StopMapPicker({
    region,
    setRegion,
    marker,
    setMarker,
    existingStops,
    currentStopType = StopType.Viewpoint,
    editingIndex = null
}: StopMapPickerProps) {
    const { theme, mode } = useTheme();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResultsVisible, setIsResultsVisible] = useState(false);

    const handleMapPress = (e: any) => {
        setMarker(e.nativeEvent.coordinate);
        Keyboard.dismiss();
        setIsResultsVisible(false);
    };

    const fetchResults = useCallback(async (query: string) => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`;
            const response = await fetch(url);
            const data = await response.json();

            const mappedResults = data.features.map((f: any) => ({
                name: f.properties.name,
                description: [f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', '),
                latitude: f.geometry.coordinates[1],
                longitude: f.geometry.coordinates[0],
            }));

            setResults(mappedResults);
            setIsResultsVisible(true);
        } catch (error) {
            console.error('Failed to fetch search results:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) fetchResults(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchResults]);

    const handleSelectResult = (result: SearchResult) => {
        const newRegion = {
            ...region,
            latitude: result.latitude,
            longitude: result.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        setMarker({ latitude: result.latitude, longitude: result.longitude });
        setSearchQuery(result.name);
        setIsResultsVisible(false);
        Keyboard.dismiss();
    };

    const routeCoordinates = [...existingStops.map(s => ({ latitude: s.latitude, longitude: s.longitude }))];

    if (marker) {
        if (editingIndex !== null && editingIndex !== undefined && editingIndex < routeCoordinates.length) {
            routeCoordinates[editingIndex] = marker;
        } else {
            routeCoordinates.push(marker);
        }
    }

    return (
        <View style={styles.mapContainer}>
            <MapView
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                region={region}
                userInterfaceStyle={mode}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
                showsUserLocation
                showsMyLocationButton
            >
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

                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor={theme.primary}
                    strokeWidth={3}
                    lineDashPattern={[5, 5]}
                />

                {marker && (
                    <Marker coordinate={marker}>
                        <View style={[styles.markerPip, { backgroundColor: theme.primary, borderColor: 'white', borderWidth: 2 }]}>
                            {getStopIcon(currentStopType, 16, 'white')}
                        </View>
                    </Marker>
                )}
            </MapView>

            {/* Search Bar Overlay */}
            <View style={styles.searchOverlay}>
                <BlurView intensity={80} tint={mode} style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.textPrimary }]}
                        placeholder={t('searchPlacePlaceholder')}
                        placeholderTextColor={theme.textTertiary}
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            if (text.length === 0) {
                                setResults([]);
                                setIsResultsVisible(false);
                            }
                        }}
                        onFocus={() => {
                            if (results.length > 0) setIsResultsVisible(true);
                        }}
                    />
                    {isLoading ? (
                        <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
                    ) : searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            setResults([]);
                            setIsResultsVisible(false);
                        }}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </BlurView>

                {isResultsVisible && results.length > 0 && (
                    <View style={[styles.resultsList, { backgroundColor: theme.bgPrimary, borderColor: theme.borderPrimary }]}>
                        <FlatList
                            data={results}
                            keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.resultItem, { borderBottomColor: theme.borderSecondary }]}
                                    onPress={() => handleSelectResult(item)}
                                >
                                    <Ionicons name="location-outline" size={18} color={theme.primary} style={styles.resultIcon} />
                                    <View style={styles.resultTextContainer}>
                                        <TextComponent bold variant="body" color={theme.textPrimary}>{item.name}</TextComponent>
                                        <TextComponent variant="caption" color={theme.textSecondary} numberOfLines={1}>{item.description}</TextComponent>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                )}
            </View>

            {!marker && !isResultsVisible && (
                <View style={styles.mapInstruction}>
                    <TextComponent style={styles.mapInstructionText} color="white" bold variant="body">
                        Tap map to set location
                    </TextComponent>
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
    searchOverlay: {
        position: 'absolute',
        top: 20,
        left: 16,
        right: 16,
        zIndex: 1000,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 46,
        borderRadius: 23,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    loader: {
        marginLeft: 8,
    },
    resultsList: {
        marginTop: 8,
        borderRadius: 16,
        borderWidth: 1,
        maxHeight: 200,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
    },
    resultIcon: {
        marginRight: 12,
    },
    resultTextContainer: {
        flex: 1,
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
