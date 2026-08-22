import { Stop } from '../types/models';

export function haversineDistance(lat1: any, lon1: any, lat2: any, lon2: any): number {
    const l1 = Number(lat1);
    const ln1 = Number(lon1);
    const l2 = Number(lat2);
    const ln2 = Number(lon2);

    if (isNaN(l1) || isNaN(ln1) || isNaN(l2) || isNaN(ln2)) {
        return Infinity;
    }

    const R = 6371; // Earth's radius in kilometers
    const dLat = ((l2 - l1) * Math.PI) / 180;
    const dLon = ((ln2 - ln1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((l1 * Math.PI) / 180) *
            Math.cos((l2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Queries OSRM table API to retrieve the walking distance matrix between the user and remaining stops.
 */
async function getOSRMDistanceTable(coords: { latitude: number; longitude: number }[]): Promise<number[][] | null> {
    if (coords.length < 2) return null;
    const coordsStr = coords.map(c => `${c.longitude},${c.latitude}`).join(';');
    const url = `https://router.project-osrm.org/table/v1/foot/${coordsStr}?annotations=distance`;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (response.ok) {
            const data = await response.json();
            if (data && data.distances) {
                // Convert OSRM meters to kilometers
                return data.distances.map((row: any) =>
                    row.map((val: any) => (val !== null ? val / 1000.0 : 999.0))
                );
            }
        }
    } catch (e) {
        console.warn('⚠️ OSRM route optimization table fetch failed, using Haversine:', e);
    }
    return null;
}

function getHaversineDistanceTable(coords: { latitude: number; longitude: number }[]): number[][] {
    const n = coords.length;
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                matrix[i][j] = haversineDistance(coords[i].latitude, coords[i].longitude, coords[j].latitude, coords[j].longitude);
            }
        }
    }
    return matrix;
}

export function twoOpt(route: (Stop & { _tempIdx: number })[], distMatrix: number[][]): Stop[] {
    // Route starts with user location at index 0 (fixed), followed by stops
    // We want to optimize the whole path starting from the user's GPS coordinates
    const routeWithUser = [{ _tempIdx: 0 } as any, ...route];
    if (routeWithUser.length < 4) {
        return route;
    }

    let bestRoute = [...routeWithUser];
    let improved = true;

    const getRouteDistance = (r: any[]): number => {
        let d = 0.0;
        for (let i = 0; i < r.length - 1; i++) {
            d += distMatrix[r[i]._tempIdx][r[i + 1]._tempIdx];
        }
        return d;
    };

    let bestDistance = getRouteDistance(bestRoute);

    while (improved) {
        improved = false;
        // i starts at 1, so the user location at index 0 remains fixed!
        for (let i = 1; i < bestRoute.length - 2; i++) {
            for (let j = i + 1; j < bestRoute.length; j++) {
                if (j - i === 1) {
                    continue; // adjacent edges cannot be swapped
                }

                // Propose a swap: reverse the segment from i to j-1
                const newRoute = [...bestRoute];
                const subArray = bestRoute.slice(i, j).reverse();
                newRoute.splice(i, j - i, ...subArray);

                const newDistance = getRouteDistance(newRoute);
                if (newDistance < bestDistance - 1e-6) {
                    bestRoute = newRoute;
                    bestDistance = newDistance;
                    improved = true;
                    break;
                }
            }
            if (improved) {
                break;
            }
        }
    }

    // Return the route excluding the user location node at index 0
    return bestRoute.slice(1);
}

/**
 * Optimizes the remaining stops layout starting from the user's current GPS location.
 */
export async function optimizeRemainingRoute(
    remainingStops: Stop[],
    userLat: number,
    userLng: number
): Promise<Stop[]> {
    if (remainingStops.length === 0) {
        return [];
    }

    // Separate finale stop if exists
    const regularStops: Stop[] = [];
    let finaleStop: Stop | null = null;

    for (const stop of remainingStops) {
        if (stop.name.toLowerCase().includes('finale') || stop.name.toLowerCase().includes('grand finale')) {
            finaleStop = stop;
        } else {
            regularStops.push(stop);
        }
    }

    const stopsToOptimize = regularStops.length > 0 ? regularStops : remainingStops;
    
    // Nodes to calculate matrix: Index 0 is the user's starting location
    const nodes = [
        { latitude: userLat, longitude: userLng },
        ...stopsToOptimize
    ];

    const distMatrix = await getOSRMDistanceTable(nodes) || getHaversineDistanceTable(nodes);

    // Map stops to their index in distMatrix (index in nodes)
    const remaining = stopsToOptimize.map((stop, idx) => ({
        ...stop,
        _tempIdx: idx + 1 // Offset by 1 because index 0 is the user location
    }));

    // Find the first stop: the closest remaining stop to user location (user index is 0)
    let closestIdx = 0;
    let closestDist = distMatrix[0][remaining[0]._tempIdx];

    for (let i = 1; i < remaining.length; i++) {
        const dist = distMatrix[0][remaining[i]._tempIdx];
        if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
        }
    }

    let current = remaining.splice(closestIdx, 1)[0];
    const bestOrdered = [current];

    // Nearest Neighbor construction
    while (remaining.length > 0) {
        let nextClosestIdx = 0;
        let nextClosestDist = distMatrix[current._tempIdx][remaining[0]._tempIdx];

        for (let i = 1; i < remaining.length; i++) {
            const dist = distMatrix[current._tempIdx][remaining[i]._tempIdx];
            if (dist < nextClosestDist) {
                nextClosestDist = dist;
                nextClosestIdx = i;
            }
        }

        current = remaining.splice(nextClosestIdx, 1)[0];
        bestOrdered.push(current);
    }

    // Apply 2-opt refinement
    let optimized = twoOpt(bestOrdered, distMatrix);

    // Clean up temporary index fields
    const cleaned = optimized.map(({ _tempIdx, ...rest }) => rest as Stop);

    // Append finale stop back at the very end if we separated it
    if (finaleStop && regularStops.length > 0) {
        cleaned.push(finaleStop);
    }

    return cleaned;
}
