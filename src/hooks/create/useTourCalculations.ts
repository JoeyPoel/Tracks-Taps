import { calculateDistance } from '@/src/utils/mapUtils';
import { useMemo } from 'react';

export function useTourCalculations(stops: any[], modes: string[]) {
    // Distance & Duration
    const { distance, duration } = useMemo(() => {
        if (stops.length < 2) {
            return {
                distance: stops.length === 0 ? '0' : undefined,
                duration: stops.length === 0 ? '0' : undefined
            };
        }

        let totalDist = 0;
        for (let i = 0; i < stops.length - 1; i++) {
            const s1 = stops[i];
            const s2 = stops[i + 1];
            totalDist += calculateDistance(s1.latitude, s1.longitude, s2.latitude, s2.longitude);
        }

        // Apply Tortuosity Factor (1.3x for city streets vs straight line)
        const estWalkingDist = totalDist * 1.3;

        // Estimation: 4.5km/h walking speed + 15 mins per stop for dwelling/challenges
        const calculatedDuration = Math.round((estWalkingDist / 4.5) * 60 + (stops.length * 15));

        return {
            distance: estWalkingDist.toFixed(1),
            duration: String(calculatedDuration)
        };
    }, [stops]);

    // Points
    const points = useMemo(() => {
        let totalPoints = 0;

        // Sum points from all challenges in all stops
        stops.forEach(stop => {
            if (stop.challenges && Array.isArray(stop.challenges)) {
                stop.challenges.forEach((challenge: any) => {
                    totalPoints += (parseInt(challenge.points) || 0);
                });
            }
        });

        // Add 200 points per stop if PubGolf mode is active AND the stop has PubGolf data
        if (modes.includes('PUBGOLF')) {
            stops.forEach(stop => {
                if (stop.pubgolfPar && stop.pubgolfDrink) {
                    totalPoints += 200;
                }
            });
        }

        return totalPoints;
    }, [stops, modes]);

    return { distance, duration, points };
}
