import * as Location from 'expo-location';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from 'react-native-maps';
import { routingService } from '../services/routingService';
import { tourService } from '../services/tourService';
import { Tour } from '../types/models';
import { useMapFit } from './useMapFit';
import { useMapTours } from './useMapTour';

import { useStore } from '../store/store';

export const useMapScreenLogic = () => {
    const mapRef = useRef<MapView>(null);
    const handleRegionChangeTimeout = useRef<any>(null);
    const lastRegion = useRef<any>(null);
    const regionRef = useRef<any>(null);
    const { tourId } = useLocalSearchParams();
    const { setTabBarVisible } = useStore();

    const { tours, loading, refetch } = useMapTours();
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [routeSegments, setRouteSegments] = useState<any[]>([]);

    // Handle deep linking / navigation with tourId
    useEffect(() => {
        if (tourId) {
            const id = Number(tourId);
            const found = tours.find(t => t.id === id);

            if (found) {
                handleTourSelect(found);
            } else {
                // If not in current list (maybe outside bounds), fetch it specifically
                tourService.getTourById(id).then(tour => {
                    if (tour) {
                        // Cast to Map Tour type if needed or ensure compatibility
                        // Assuming getTourById returns full Tour which matches Map Tour structure
                        const mapTour = tour;
                        handleTourSelect(mapTour);
                        // Optionally update map view immediately to this tour's location
                        if (mapTour.stops && mapTour.stops.length > 0) {
                            const firstStop = mapTour.stops[0];
                            mapRef.current?.animateToRegion({
                                latitude: firstStop.latitude,
                                longitude: firstStop.longitude,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05
                            }, 1000);
                        }
                    }
                }).catch(err => console.error("Failed to fetch selected tour on map", err));
            }
        }
    }, [tourId, tours.length]); // Depend on tours.length to retry if tours load laters

    // Initial Location Effect
    useEffect(() => {
        if (tourId) return; // Skip initial location if we have a target tour

        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    // Fallback to Amsterdam if permission denied
                    mapRef.current?.animateToRegion({
                        latitude: 52.3676,
                        longitude: 4.9041,
                        latitudeDelta: 0.1,
                        longitudeDelta: 0.1,
                    }, 1000);
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                mapRef.current?.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);

            } catch (error) {
                console.log('Error getting location:', error);
                // Fallback to Amsterdam
                mapRef.current?.animateToRegion({
                    latitude: 52.3676,
                    longitude: 4.9041,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }, 1000);
            }
        })();
    }, [tourId]);

    // Handle Tab Bar Visibility on Focus/Blur
    useFocusEffect(
        useCallback(() => {
            // When screen gains focus
            if (selectedTour) {
                setTabBarVisible(false);
            } else {
                setTabBarVisible(true);
            }

            return () => {
                // When screen loses focus
                setTabBarVisible(true);
            };
        }, [selectedTour, setTabBarVisible])
    );

    useMapFit(mapRef, tours, selectedTour);

    const handleTourSelect = async (tour: Tour) => {
        // Save the last known region before zooming into the tour
        if (regionRef.current) {
            lastRegion.current = regionRef.current;
        }

        // 1. Optimistic update with available data (shows card immediately)
        setSelectedTour(tour);
        setTabBarVisible(false);

        // 2. Check if we need to fetch full details (stops/route)
        let detailedTour = tour;
        if (!tour.stops || tour.stops.length <= 1) {
            try {
                const fetched = await tourService.getTourById(tour.id);
                if (fetched) {
                    detailedTour = fetched as Tour;
                    setSelectedTour(detailedTour); // Update UI with full details
                }
            } catch (error) {
                console.error('Failed to fetch tour details for map:', error);
            }
        }

        // 3. Fetch route segments if stops exist (using detailedTour)
        if (detailedTour.stops && detailedTour.stops.length > 1) {
            // Sort stops first to be safe
            const sortedStops = [...detailedTour.stops].sort((a: any, b: any) => a.number - b.number);

            // Initial direct segments for immediate feedback
            const initialSegments = [];
            for (let i = 0; i < sortedStops.length - 1; i++) {
                initialSegments.push({
                    coords: [
                        { latitude: sortedStops[i].latitude, longitude: sortedStops[i].longitude },
                        { latitude: sortedStops[i + 1].latitude, longitude: sortedStops[i + 1].longitude }
                    ],
                    type: 'DIRECT'
                });
            }
            setRouteSegments(initialSegments);

            // Fetch actual route
            const routeData = await routingService.getTourRoute(sortedStops.map((s: any) => ({
                latitude: s.latitude,
                longitude: s.longitude
            })));
            setRouteSegments(routeData);
        } else {
            setRouteSegments([]);
        }
    };

    const handleBack = () => {
        setSelectedTour(null);
        setRouteSegments([]);
        setTabBarVisible(true); // Show tab bar
        // Restore the previous region
        if (lastRegion.current && mapRef.current) {
            // Small delay to allow state update to process
            setTimeout(() => {
                mapRef.current?.animateToRegion(lastRegion.current, 1000);
            }, 100);
        } else {
            // Default back to user location or Amsterdam if no last region
            // This covers the case where we deeplinked in
            // For now do nothing or maybe re-trigger location check?
        }
    };

    const onRegionChangeComplete = (region: any) => {
        regionRef.current = region;

        // Don't fetch if we are viewing a selected tour
        if (selectedTour) return;

        if (handleRegionChangeTimeout.current) {
            clearTimeout(handleRegionChangeTimeout.current);
        }
        handleRegionChangeTimeout.current = setTimeout(() => {
            const bounds = {
                minLat: region.latitude - region.latitudeDelta / 2,
                maxLat: region.latitude + region.latitudeDelta / 2,
                minLng: region.longitude - region.longitudeDelta / 2,
                maxLng: region.longitude + region.longitudeDelta / 2,
            };
            refetch(bounds);
        }, 500);
    };

    return {
        mapRef,
        tours,
        loading,
        selectedTour,
        routeSegments,
        handleTourSelect,
        handleBack,
        onRegionChangeComplete
    };
};
