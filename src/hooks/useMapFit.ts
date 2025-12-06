import { RefObject, useEffect } from 'react';
import MapView from 'react-native-maps';
import { Stop, Tour } from '../types/models';

export const useMapFit = (
    mapRef: RefObject<MapView | null>,
    tours: Tour[],
    selectedTour: Tour | null
) => {
    useEffect(() => {
        if (selectedTour && mapRef.current) {
            // Zoom to fit the selected tour's stops
            const stops = (selectedTour as any).stops || [];
            if (stops.length > 0) {
                const coordinates = stops.map((s: Stop) => ({
                    latitude: s.latitude,
                    longitude: s.longitude,
                }));

                // Add a small delay to ensure map is ready
                setTimeout(() => {
                    mapRef.current?.fitToCoordinates(coordinates, {
                        edgePadding: { top: 100, right: 50, bottom: 250, left: 50 }, // Increased bottom padding for card
                        animated: true,
                    });
                }, 100);
            }
        }
    }, [selectedTour, tours, mapRef]);
};
