
import { useEffect, useState } from 'react';
import { TourType } from '../../types/models';
import { useTourCalculations } from './useTourCalculations';

export type TourDraft = {
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    difficulty: string;
    modes: string[];
    stops: any[];
    distance: string;
    duration: string;
    points: number;
    genre: string;
    startLat?: number;
    startLng?: number;
    type: TourType | string; // New field
};

const INITIAL_DRAFT: TourDraft = {
    title: '',
    description: '',
    location: '',
    imageUrl: '',
    difficulty: 'MEDIUM',
    genre: 'Adventure',
    modes: [],
    stops: [],
    distance: '0',
    duration: '0',
    points: 0,
    startLat: undefined,
    startLng: undefined,
    type: TourType.QUICK_TRIP, // Default
};

export function useTourDraft() {
    const [tourDraft, setTourDraft] = useState<TourDraft>(INITIAL_DRAFT);

    // Calculate derived metrics
    const { distance, duration, points } = useTourCalculations(tourDraft.stops, tourDraft.modes);

    // Sync calculated metrics to draft
    // Note: We use useEffect to only update when values actually change and differ from draft
    useEffect(() => {
        setTourDraft(prev => {
            const updates: Partial<TourDraft> = {};
            if (distance !== undefined && prev.distance !== distance) updates.distance = distance;
            if (duration !== undefined && prev.duration !== duration) updates.duration = duration;
            if (prev.points !== points) updates.points = points;

            // Auto-set start location from first stop
            if (prev.stops.length > 0) {
                const firstStop = prev.stops[0];
                if (firstStop.latitude && firstStop.longitude) {
                    if (prev.startLat !== firstStop.latitude || prev.startLng !== firstStop.longitude) {
                        updates.startLat = firstStop.latitude;
                        updates.startLng = firstStop.longitude;
                    }
                }
            }

            if (Object.keys(updates).length > 0) {
                return { ...prev, ...updates };
            }
            return prev;
        });
    }, [distance, duration, points, tourDraft.stops]); // Add tourDraft.stops dependency

    const updateDraft = (key: keyof TourDraft, value: any) => {
        setTourDraft(prev => ({ ...prev, [key]: value }));
    };

    // --- Actions ---

    const addStop = (stop: any) => {
        const newStop = { ...stop, number: tourDraft.stops.length + 1 };
        updateDraft('stops', [...tourDraft.stops, newStop]);
    };

    const removeStop = (index: number) => {
        const newStops = tourDraft.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, number: i + 1 }));
        updateDraft('stops', newStops);
    };

    const editStop = (index: number, updatedStop: any) => {
        const newStops = [...tourDraft.stops];
        // Ensure we preserve the challenges of the stop we are editing
        newStops[index] = { ...updatedStop, challenges: newStops[index].challenges };
        updateDraft('stops', newStops);
    };

    const addChallengeToStop = (stopIndex: number, challenge: any) => {
        const newStops = [...tourDraft.stops];
        const stop = newStops[stopIndex];
        stop.challenges = [...(stop.challenges || []), challenge];
        updateDraft('stops', newStops);
    };

    const removeChallengeFromStop = (stopIndex: number, challengeIndex: number) => {
        const newStops = [...tourDraft.stops];
        const stop = newStops[stopIndex];
        stop.challenges = stop.challenges.filter((_: any, i: number) => i !== challengeIndex);
        updateDraft('stops', newStops);
    };

    const editChallengeInStop = (stopIndex: number, challengeIndex: number, updatedChallenge: any) => {
        const newStops = [...tourDraft.stops];
        const stop = newStops[stopIndex];
        const newChallenges = [...stop.challenges];
        newChallenges[challengeIndex] = updatedChallenge;
        stop.challenges = newChallenges;
        updateDraft('stops', newStops);
    };

    const toggleMode = (mode: string) => {
        const currentModes = tourDraft.modes;
        if (currentModes.includes(mode)) {
            updateDraft('modes', currentModes.filter(m => m !== mode));
        } else {
            updateDraft('modes', [...currentModes, mode]);
        }
    };

    return {
        tourDraft,
        updateDraft,
        actions: {
            addStop,
            editStop,
            removeStop,
            addChallengeToStop,
            removeChallengeFromStop,
            editChallengeInStop,
            toggleMode
        }
    };
}
