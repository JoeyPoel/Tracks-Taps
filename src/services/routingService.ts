import type { LatLng } from 'react-native-maps';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/foot';

export interface RouteResult {
    coords: LatLng[];
    type: 'WALKING' | 'DIRECT';
}

// Helper to calculate straight-line distance (Haversine formula) in kilometers
function getDirectDistance(start: LatLng, end: LatLng): number {
    const R = 6371; // Radius of the earth in km
    const dLat = (end.latitude - start.latitude) * (Math.PI / 180);
    const dLon = (end.longitude - start.longitude) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(start.latitude * (Math.PI / 180)) * Math.cos(end.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const routingService = {
    /**
     * Fetches a walking route between two points.
     * Checks if the walking route is a "big om" (detour) > 2x direct distance.
     * If so, returns a direct line (DIRECT type).
     * Otherwise, returns the walking path (WALKING type).
     */
    async getWalkingRoute(start: LatLng, end: LatLng): Promise<RouteResult> {
        try {
            // Calculate direct distance first
            const directDistKm = getDirectDistance(start, end);

            // OSRM expects "longitude,latitude"
            // Use overview=simplified for faster response and smaller payload
            // Steps=true not needed, annotations=distance maybe? We get distance in 'routes[0].distance' (meters)
            const url = `${OSRM_BASE_URL}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=simplified&geometries=geojson`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`OSRM API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
                throw new Error('No route found');
            }

            const route = data.routes[0];
            const walkingDistKm = route.distance / 1000; // OSRM returns meters

            // Detour check: is walking distance > 2x direct distance?
            if (walkingDistKm > directDistKm * 2) {
                // Yes, big detour. Check if direct line makes more sense.
                // Return direct line.
                return {
                    coords: [start, end],
                    type: 'DIRECT'
                };
            }

            // Extract coordinates from GeoJSON (lon, lat) and convert to LatLng (lat, lon)
            const coordinates = route.geometry.coordinates.map((coord: [number, number]) => ({
                latitude: coord[1],
                longitude: coord[0],
            }));

            return {
                coords: coordinates,
                type: 'WALKING'
            };

        } catch (error) {
            console.warn('Failed to fetch walking route:', error);
            // Fallback
            return {
                coords: [start, end],
                type: 'DIRECT'
            };
        }
    },

    /**
     * Fetches the full tour route as a series of segments between stops.
     * Applies the detour check for each leg of the tour.
     */
    async getTourRoute(stops: LatLng[]): Promise<RouteResult[]> {
        if (stops.length < 2) return [];

        // Construct coordinates string for OSRM: "lon,lat;lon,lat;..."
        // We break it into chunks if too long, but for standard tours (10-20 stops) it should be fine.
        // If > 25 stops, maybe split? Let's assume < 50 for now.

        // We need to fetch the full route passing through all stops.
        const coordsString = stops.map(s => `${s.longitude},${s.latitude}`).join(';');
        const url = `${OSRM_BASE_URL}/${coordsString}?overview=simplified&geometries=geojson&legs=true`; // legs=true is default but explicit is good

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('OSRM Error');
            const data = await response.json();

            if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) throw new Error('No route');

            const route = data.routes[0];
            const legs = route.legs; // Array of leg objects, each containing steps, distance, duration...
            // IMPORTANT: OSRM with overview=simplified returns ONE geometry for the whole route, OR per leg?
            // Actually, with overview=simplified, the `geometry` property is for the *entire* route.
            // Getting geometry per leg with `geometries=geojson` is not standard in 'legs' array usually.
            // Usually `legs` contains `steps` if requested, or just summary.
            // To get geometry per leg, one approach is to use `steps=true` and assemble, OR assume OSRM returns absolute geometry.
            // Wait, we need to split the geometry if we want to style parts differently (Direct vs Walking).
            // If the *entire* route geometry is returned, we can't easily replace just one leg with a straight line unless we know the index range.

            // ALTERNATIVE: Since we accept each leg might be different (Text: "check if the route is like such a big om route..."),
            // maybe it's safer/easier to just iterate and call getWalkingRoute for each pair?
            // OSRM Multi-stop request calculates the optimal path visiting nodes in order. 
            // Individual requests effectively do the same but in N requests.
            // Given N is small (~12), doing parallel requests is probably fine and much easier to manage for "per-leg styling".
            // Also avoids the "matching geometry to leg" complexity.

            const segments: RouteResult[] = [];
            const promises = [];

            for (let i = 0; i < stops.length - 1; i++) {
                promises.push(this.getWalkingRoute(stops[i], stops[i + 1]));
            }

            // Wait for all segments
            const results = await Promise.all(promises);
            return results;

        } catch (e) {
            console.warn('Multistop route failed, falling back to all direct', e);
            // Fallback: all direct
            const fallback: RouteResult[] = [];
            for (let i = 0; i < stops.length - 1; i++) {
                fallback.push({
                    coords: [stops[i], stops[i + 1]],
                    type: 'DIRECT'
                });
            }
            return fallback;
        }
    }
};
