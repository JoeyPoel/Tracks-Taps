import { useCallback, useEffect, useState } from 'react';
import { activeTourService } from '../services/activeTourService';

export const useActiveTour = (activeTourId: number, userId?: number, onXpEarned?: (amount: number) => void) => {
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const [activeTour, setActiveTour] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Local state for immediate UI updates before refetch/sync
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [failedChallenges, setFailedChallenges] = useState<Set<number>>(new Set());
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({}); // challengeId -> selectedIndex

    const fetchActiveTour = useCallback(async () => {
        if (!activeTourId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await activeTourService.getActiveTourById(activeTourId);
            setActiveTour(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [activeTourId]);

    useEffect(() => {
        fetchActiveTour();
    }, [fetchActiveTour]);

    // Sync completed and failed challenges from API and calculate current stop
    useEffect(() => {
        if (activeTour?.activeChallenges && activeTour?.tour?.stops) {
            const completed = new Set<number>();
            const failed = new Set<number>();
            let xp = 0;

            activeTour.activeChallenges.forEach((ac: any) => {
                if (ac.completed) {
                    completed.add(ac.challengeId);
                    if (ac.challenge?.points) {
                        xp += ac.challenge.points;
                    }
                }
                if (ac.failed) failed.add(ac.challengeId);
            });

            setCompletedChallenges(completed);
            setFailedChallenges(failed);
            setPoints(xp);

            // Calculate Streak
            const allChallenges: any[] = [];
            activeTour.tour.stops.forEach((stop: any) => {
                if (stop.challenges) {
                    allChallenges.push(...stop.challenges);
                }
            });

            let currentStreak = 0;
            for (const challenge of allChallenges) {
                if (completed.has(challenge.id)) {
                    currentStreak++;
                } else if (failed.has(challenge.id)) {
                    currentStreak = 0;
                } else {
                    // Not attempted yet, stop counting streak
                    break;
                }
            }
            setStreak(currentStreak);

            let index = 0;
            const stops = activeTour.tour.stops;
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                const allChallengesDone = stop.challenges.every((c: any) => completed.has(c.id) || failed.has(c.id));
                if (!allChallengesDone) {
                    index = i;
                    break;
                }
                // If it's the last stop and all completed/failed, we can stay there or handle completion
                if (i === stops.length - 1 && allChallengesDone) {
                    index = i;
                    break; // Should break here too or set index to i? Original code logic:
                    // if (i === stops.length - 1 && allChallengesDone) { index = i; }
                    // Actually original code logic was:
                    /*
                    if (!allChallengesDone) {
                        index = i;
                        break;
                    }
                    if (i === stops.length - 1 && allChallengesDone) {
                        index = i;
                    }
                    */
                }
            }
            // Re-implementing original logic exactly to avoid regression
            let calculatedIndex = 0;
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                const allChallengesDone = stop.challenges.every((c: any) => completed.has(c.id) || failed.has(c.id));
                if (!allChallengesDone) {
                    calculatedIndex = i;
                    break;
                }
                if (i === stops.length - 1 && allChallengesDone) {
                    calculatedIndex = i;
                }
            }
            setCurrentStopIndex(calculatedIndex);
        }
    }, [activeTour]);

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
        setPoints(prev => prev + amount);
    };

    const handleChallengeComplete = async (challenge: any) => {
        if (completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newCompleted = new Set(completedChallenges);
        newCompleted.add(challenge.id);
        setCompletedChallenges(newCompleted);
        triggerFloatingPoints(challenge.points);
        setStreak(prev => prev + 1);

        if (onXpEarned) {
            onXpEarned(challenge.points);
        }


        try {
            if (userId) {
                await activeTourService.completeChallenge(activeTourId, challenge.id, userId);
            }
        } catch (err) {
            console.error('Failed to complete challenge', err);
        }
    };

    const handleChallengeFail = async (challenge: any) => {
        if (completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newFailed = new Set(failedChallenges);
        newFailed.add(challenge.id);
        setFailedChallenges(newFailed);
        setStreak(0);

        try {
            await activeTourService.failChallenge(activeTourId, challenge.id);
        } catch (err) {
            console.error('Failed to fail challenge', err);
        }
    };


    const handleSubmitTrivia = (challenge: any) => {
        const selectedIndex = triviaSelected[challenge.id];
        if (selectedIndex === undefined || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        const selectedOption = challenge.options[selectedIndex];
        if (selectedOption === challenge.answer) {
            handleChallengeComplete(challenge);
        } else {
            handleChallengeFail(challenge);
        }
    };

    const handlePrevStop = () => {
        if (currentStopIndex > 0) {
            setCurrentStopIndex(prev => prev - 1);
        }
    };

    const handleNextStop = () => {
        if (activeTour && currentStopIndex < activeTour.tour.stops.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
        }
    };

    const handleFinishTour = async (): Promise<boolean> => {
        try {
            const response = await activeTourService.finishTour(activeTourId);
            // Assuming response is the updated tour or success indicator.
            // Original code checked if response.ok (fetch API).
            // activeTourService.finishTour returns response.data.
            // If it throws, it goes to catch.
            if (response) {
                setShowConfetti(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to finish tour:', error);
            return false;
        }
    };

    const handleAbandonTour = async () => {
        try {
            await activeTourService.abandonTour(activeTourId);
            // Navigation should be handled by the component calling this
        } catch (error) {
            console.error('Failed to abandon tour:', error);
        }
    };

    return {
        activeTour,
        loading,
        error,
        currentStopIndex,
        completedChallenges,
        failedChallenges,
        triviaSelected,
        setTriviaSelected,
        showFloatingPoints,
        floatingPointsAmount,
        setShowFloatingPoints,
        showConfetti,
        handleSubmitTrivia,
        handleChallengeComplete,
        handleChallengeFail,
        handlePrevStop,
        handleNextStop,
        handleFinishTour,
        handleAbandonTour,
        streak,
        points,
    };
};
