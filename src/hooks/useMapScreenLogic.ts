import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import MapView from 'react-native-maps';
import { routingService } from '../services/routingService';
import { Tour } from '../types/models';
import { useMapFit } from './useMapFit';
import { useMapTours } from './useMapTour';

export const useMapScreenLogic = () => {
    const mapRef = useRef<MapView>(null);
    const handleRegionChangeTimeout = useRef<any>(null);
    const lastRegion = useRef<any>(null);
    const regionRef = useRef<any>(null);

    const { tours, loading, refetch } = useMapTours();
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [routeSegments, setRouteSegments] = useState<any[]>([]);

    // Initial Location Effect
    useEffect(() => {
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
    }, []);

    useMapFit(mapRef, tours, selectedTour);

    const handleTourSelect = async (tour: Tour) => {
        // Save the last known region before zooming into the tour
        if (regionRef.current) {
            lastRegion.current = regionRef.current;
        }
        setSelectedTour(tour);

        // Fetch route segments if stops exist
        if (tour.stops && tour.stops.length > 1) {
            // Sort stops first to be safe
            const sortedStops = [...tour.stops].sort((a: any, b: any) => a.order - b.order);

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
        // Restore the previous region
        if (lastRegion.current && mapRef.current) {
            // Small delay to allow state update to process
            setTimeout(() => {
                mapRef.current?.animateToRegion(lastRegion.current, 1000);
            }, 100);
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
