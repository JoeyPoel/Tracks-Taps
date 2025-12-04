import { RefObject, useEffect } from 'react';
import MapView, { LatLng } from 'react-native-maps';
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
        } else if (!selectedTour && tours.length > 0 && mapRef.current) {
            // Reset view to show all tour start points
            const startPoints: LatLng[] = [];
            tours.forEach((tour: any) => {
                if (tour.stops && tour.stops.length > 0) {
                    const firstStop = tour.stops.find((s: Stop) => s.order === 1) || tour.stops[0];
                    if (firstStop) {
                        startPoints.push({
                            latitude: firstStop.latitude,
                            longitude: firstStop.longitude
                        });
                    }
                }
            });

            if (startPoints.length > 0) {
                setTimeout(() => {
                    mapRef.current?.fitToCoordinates(startPoints, {
                        edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                        animated: true,
                    });
                }, 100);
            }
        }
    }, [selectedTour, tours, mapRef]);
};
