import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { StopType } from '@/src/types/models';
import { getStopIcon } from '@/src/utils/stopIcons';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, LayoutAnimation, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';

interface StopMapPickerProps {
    region: Region;
    setRegion: (region: Region) => void;
    marker: { latitude: number; longitude: number } | null;
    setMarker: (marker: { latitude: number; longitude: number } | null) => void;
    existingStops: any[];
    currentStopType?: StopType;
    editingIndex?: number | null;
    onSearchActiveChange?: (active: boolean) => void;
    isExpanded?: boolean;
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
    editingIndex = null,
    onSearchActiveChange,
    isExpanded = false
}: StopMapPickerProps) {
    const { theme, mode } = useTheme();
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResultsVisible, setIsResultsVisible] = useState(false);
    const [selectedResult, setSelectedResult] = useState<{ item: SearchResult; index: number } | null>(null);
    const [preStageRegion, setPreStageRegion] = useState<Region | null>(null);
    const [initialRegion, setInitialRegion] = useState<Region | null>(null);
    const mapRef = useRef<MapView>(null);
    const isAnimating = useRef(false);

    const handleMapPress = (e: any) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMarker(e.nativeEvent.coordinate);
        Keyboard.dismiss();
        setIsResultsVisible(false);
        setSelectedResult(null);
        onSearchActiveChange?.(false);
    };

    const fetchResults = useCallback(async (query: string) => {
        if (query.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Calculate bounding box from current region to prioritize local results
            // minLon, minLat, maxLon, maxLat
            const minLon = region.longitude - region.longitudeDelta / 2;
            const minLat = region.latitude - region.latitudeDelta / 2;
            const maxLon = region.longitude + region.longitudeDelta / 2;
            const maxLat = region.latitude + region.latitudeDelta / 2;
            const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=${bbox}&limit=10`;
            const response = await fetch(url);
            const data = await response.json();

            const mappedResults = data.features.map((f: any) => ({
                name: f.properties.name,
                description: [f.properties.city, f.properties.district, f.properties.state, f.properties.country].filter(Boolean).join(', '),
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
    }, [region]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) fetchResults(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchResults]);

    const handleStageResult = (result: SearchResult, index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPreStageRegion(region); // Save current view to return to on cancel
        
        const newRegion = {
            latitude: result.latitude,
            longitude: result.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
        };
        
        isAnimating.current = true;
        mapRef.current?.animateToRegion(newRegion, 600);
        setTimeout(() => { isAnimating.current = false; }, 700);

        setSelectedResult({ item: result, index });
        setSearchQuery(result.name);
        setIsResultsVisible(false); // Hide the broad list to focus on selection
        Keyboard.dismiss();
    };

    const handleFinalizeResult = () => {
        if (!selectedResult) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMarker({ latitude: selectedResult.item.latitude, longitude: selectedResult.item.longitude });
        setSearchQuery('');
        setResults([]);
        setPreStageRegion(null);
        setSelectedResult(null);
        onSearchActiveChange?.(false);
        setInitialRegion(null);
        
        const finalizeRegion = {
            latitude: selectedResult.item.latitude,
            longitude: selectedResult.item.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        };
        isAnimating.current = true;
        mapRef.current?.animateToRegion(finalizeRegion, 400);
        setTimeout(() => { isAnimating.current = false; }, 500);
    };

    // Re-center map when isExpanded changes (smooth transition)
    useEffect(() => {
        if (!isExpanded) {
            const targetRegion = marker ? {
                latitude: marker.latitude,
                longitude: marker.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            } : preStageRegion || initialRegion;

            if (targetRegion) {
                isAnimating.current = true;
                mapRef.current?.animateToRegion(targetRegion, 500);
                setTimeout(() => { isAnimating.current = false; }, 600);
            }
            
            setPreStageRegion(null);
            setInitialRegion(null);
        }
    }, [isExpanded]);

    const routeCoordinates = [...existingStops.map(s => ({ latitude: s.latitude, longitude: s.longitude }))];

    if (marker) {
        if (editingIndex !== null && editingIndex !== undefined && editingIndex < routeCoordinates.length) {
            routeCoordinates[editingIndex] = marker;
        } else {
            routeCoordinates.push(marker);
        }
    }

    return (
        <View style={[styles.mapContainer, isExpanded && styles.expandedContainer]}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                region={region}
                userInterfaceStyle={mode}
                onRegionChangeComplete={(newRegion) => {
                    if (!isAnimating.current) {
                        setRegion(newRegion);
                    }
                }}
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

                {marker && !selectedResult && (
                    <Marker key={`marker-${marker.latitude}-${marker.longitude}`} coordinate={marker} zIndex={100}>
                        <View style={[styles.markerPip, { backgroundColor: theme.primary, borderColor: theme.borderPrimary, borderWidth: 2 }]}>
                            {getStopIcon(currentStopType, 16, theme.textOnPrimary)}
                        </View>
                    </Marker>
                )}

                {/* Search Result Markers (Apple Maps style) */}
                {isResultsVisible && results.map((result, idx) => (
                    <Marker
                        key={`search-${idx}`}
                        coordinate={{ latitude: result.latitude, longitude: result.longitude }}
                        onPress={() => handleStageResult(result, idx)}
                        zIndex={50}
                    >
                        <View style={[
                            styles.searchMarker, 
                            { backgroundColor: theme.secondary, borderColor: theme.bgSecondary },
                            selectedResult?.item.latitude === result.latitude && { transform: [{ scale: 1.2 }], borderWidth: 3, borderColor: theme.primary }
                        ]}>
                            <TextComponent bold variant="caption" color={theme.textOnSecondary}>{idx + 1}</TextComponent>
                        </View>
                    </Marker>
                ))}

                {/* Explicit Highlight for Selected (if list is cleared) */}
                {selectedResult && !isResultsVisible && (
                    <Marker 
                        coordinate={{ latitude: selectedResult.item.latitude, longitude: selectedResult.item.longitude }} 
                        zIndex={100}
                        onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setSelectedResult(selectedResult); // Trigger re-center/card if needed
                        }}
                    >
                        <View style={[styles.markerPip, { backgroundColor: theme.primary, borderColor: theme.borderPrimary, borderWidth: 2 }]}>
                            {getStopIcon(currentStopType, 16, theme.textOnPrimary)}
                        </View>
                    </Marker>
                )}
            </MapView>

            {/* Search Bar Overlay */}
            <View style={styles.searchOverlay}>
                <BlurView intensity={90} tint={mode} style={styles.searchContainer}>
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
                            if (!initialRegion) setInitialRegion(region);
                            if (results.length > 0) setIsResultsVisible(true);
                            onSearchActiveChange?.(true);
                        }}
                    />
                    {isLoading ? (
                        <ActivityIndicator size="small" color={theme.primary} style={styles.loader} />
                    ) : searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => {
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setSearchQuery('');
                            setResults([]);
                            setIsResultsVisible(false);
                            onSearchActiveChange?.(false);
                            
                            // Revert map to original state if we were previewing
                            if (preStageRegion) {
                                isAnimating.current = true;
                                mapRef.current?.animateToRegion(preStageRegion, 500);
                                setTimeout(() => { isAnimating.current = false; }, 600);
                                setPreStageRegion(null);
                            } else if (marker) {
                                isAnimating.current = true;
                                mapRef.current?.animateToRegion({
                                    ...marker,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }, 500);
                                setTimeout(() => { isAnimating.current = false; }, 600);
                            }
                        }}>
                            <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                    ) : null}
                </BlurView>

                {isResultsVisible && results.length > 0 && (
                    <BlurView intensity={60} tint={mode} style={[styles.resultsList, { borderColor: theme.borderPrimary }]}>
                        <FlatList
                            data={results}
                            keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={[styles.resultItem, { borderBottomColor: theme.borderSecondary }]}
                                    onPress={() => handleStageResult(item, index)}
                                >
                                    <View style={[styles.resultNumberBadge, { backgroundColor: theme.secondary + '20' }]}>
                                        <TextComponent bold variant="label" color={theme.secondary}>{index + 1}</TextComponent>
                                    </View>
                                    <View style={styles.resultTextContainer}>
                                        <TextComponent bold variant="body" color={theme.textPrimary}>{item.name}</TextComponent>
                                        <TextComponent variant="caption" color={theme.textSecondary} numberOfLines={1}>{item.description}</TextComponent>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                        />
                    </BlurView>
                )}
            </View>

            {!marker && !isResultsVisible && !selectedResult && (
                <View style={styles.mapInstruction}>
                    <TextComponent style={styles.mapInstructionText} color="white" bold variant="body">
                        Tap map to set location
                    </TextComponent>
                </View>
            )}

            {/* Confirmation Card Overlay */}
            {selectedResult && (
                <BlurView intensity={95} tint={mode} style={styles.confirmationCard}>
                    <View style={styles.confirmationHeader}>
                        <View style={styles.confirmationInfo}>
                            <TextComponent bold variant="body" color={theme.textPrimary} numberOfLines={1}>{selectedResult.item.name}</TextComponent>
                            <TextComponent variant="caption" color={theme.textSecondary} numberOfLines={1}>{selectedResult.item.description}</TextComponent>
                        </View>
                        <TouchableOpacity 
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setSelectedResult(null);
                                setIsResultsVisible(true);
                                if (preStageRegion) {
                                    isAnimating.current = true;
                                    mapRef.current?.animateToRegion(preStageRegion, 600);
                                    setTimeout(() => { isAnimating.current = false; }, 700);
                                    setPreStageRegion(null);
                                }
                            }}
                            style={[styles.cancelButton, { backgroundColor: theme.bgTertiary }]}
                        >
                            <Ionicons name="close" size={18} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: theme.primary }]}
                        onPress={handleFinalizeResult}
                    >
                        <TextComponent bold variant="body" color={theme.textOnPrimary}>{t('selectThisLocation') || 'Select This Location'}</TextComponent>
                        <Ionicons name="checkmark-circle" size={18} color={theme.textOnPrimary} />
                    </TouchableOpacity>
                </BlurView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        height: '40%',
        width: '100%',
        position: 'relative',
        zIndex: 5,
    },
    expandedContainer: {
        height: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    searchOverlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 20 : 16,
        left: 16,
        right: 64,
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
        maxHeight: 180,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
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
    searchMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    resultNumberBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    confirmationCard: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
        overflow: 'hidden',
    },
    confirmationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    confirmationInfo: {
        flex: 1,
        marginRight: 12,
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
    },
    cancelButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
