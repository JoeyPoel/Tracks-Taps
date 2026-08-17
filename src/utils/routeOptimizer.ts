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
 * Applies the 2-opt local search algorithm to uncross segments and minimize total walking distance.
 */
export function twoOpt(route: Stop[]): Stop[] {
    if (route.length < 4) {
        return route;
    }

    let bestRoute = [...route];
    let improved = true;

    const getRouteDistance = (r: Stop[]): number => {
        let d = 0.0;
        for (let i = 0; i < r.length - 1; i++) {
            d += haversineDistance(r[i].latitude, r[i].longitude, r[i + 1].latitude, r[i + 1].longitude);
        }
        return d;
    };

    let bestDistance = getRouteDistance(bestRoute);

    while (improved) {
        improved = false;
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

    return bestRoute;
}

/**
 * Optimizes the remaining stops layout starting from the user's current GPS location.
 */
export function optimizeRemainingRoute(
    remainingStops: Stop[],
    userLat: number,
    userLng: number
): Stop[] {
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
    const remaining = [...stopsToOptimize];

    // Find the first stop: the closest remaining stop to user location
    let closestIdx = 0;
    let closestDist = haversineDistance(userLat, userLng, remaining[0].latitude, remaining[0].longitude);

    for (let i = 1; i < remaining.length; i++) {
        const dist = haversineDistance(userLat, userLng, remaining[i].latitude, remaining[i].longitude);
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
        let nextClosestDist = haversineDistance(
            current.latitude,
            current.longitude,
            remaining[0].latitude,
            remaining[0].longitude
        );

        for (let i = 1; i < remaining.length; i++) {
            const dist = haversineDistance(
                current.latitude,
                current.longitude,
                remaining[i].latitude,
                remaining[i].longitude
            );
            if (dist < nextClosestDist) {
                nextClosestDist = dist;
                nextClosestIdx = i;
            }
        }

        current = remaining.splice(nextClosestIdx, 1)[0];
        bestOrdered.push(current);
    }

    // Apply 2-opt refinement
    let optimized = twoOpt(bestOrdered);

    // Append finale stop back at the very end if we separated it
    if (finaleStop && regularStops.length > 0) {
        optimized.push(finaleStop);
    }

    return optimized;
}
