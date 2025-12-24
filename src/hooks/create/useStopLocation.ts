
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}

export function useStopLocation(visible: boolean, existingStops: any[], initialData?: any) {
    const [region, setRegion] = useState<Region>({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        (async () => {
            if (initialData && initialData.latitude && initialData.longitude) {
                setRegion({
                    latitude: initialData.latitude,
                    longitude: initialData.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                });
            } else if (existingStops && existingStops.length > 0) {
                // If adding a new stop, start at the last added stop
                const lastStop = existingStops[existingStops.length - 1];
                setRegion({
                    latitude: lastStop.latitude,
                    longitude: lastStop.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                });
            } else {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    let location = await Location.getCurrentPositionAsync({});
                    setRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                    });
                }
            }
        })();
    }, [visible, existingStops, initialData]);

    return { region, setRegion };
}
