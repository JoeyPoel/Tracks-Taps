import { useEffect, useState } from 'react';
import { useFetch } from './useFetch';

export const useActiveTour = (activeTourId: number) => {
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    // Fetch active tour data
    const { data: activeTour, loading, error, refetch } = useFetch<any>(`/api/active-tour/${activeTourId}`);

    // Local state for immediate UI updates before refetch/sync
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [failedChallenges, setFailedChallenges] = useState<Set<number>>(new Set());
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({}); // challengeId -> selectedIndex

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
                }
            }
            setCurrentStopIndex(index);
        }
    }, [activeTour]);

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
        setPoints(prev => prev + amount);
    };

    const checkAutoAdvance = (completed: Set<number>, failed: Set<number>) => {
        const currentStop = activeTour.tour.stops[currentStopIndex];
        const stopChallenges = currentStop.challenges;
        const allStopChallengesDone = stopChallenges.every((c: any) => completed.has(c.id) || failed.has(c.id));

        if (allStopChallengesDone) {
            setTimeout(() => {
                if (currentStopIndex < activeTour.tour.stops.length - 1) {
                    setCurrentStopIndex(prev => prev + 1);
                }
            }, 1500);
        }
    };

    const handleChallengeComplete = async (challenge: any) => {
        if (completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newCompleted = new Set(completedChallenges);
        newCompleted.add(challenge.id);
        setCompletedChallenges(newCompleted);
        triggerFloatingPoints(challenge.points);
        setStreak(prev => prev + 1);


        try {
            await fetch('/api/active-challenge/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTourId,
                    challengeId: challenge.id
                })
            });
            // refetch(); // Removed to prevent full page reload (loading state)
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

        // checkAutoAdvance(completedChallenges, newFailed); // Disabled auto-advance

        try {
            await fetch('/api/active-challenge/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTourId,
                    challengeId: challenge.id
                })
            });
            // refetch(); // Removed to prevent full page reload (loading state)
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
            const response = await fetch('/api/active-tour/finish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeTourId })
            });

            if (response.ok) {
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
            await fetch('/api/active-tour/abandon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeTourId })
            });
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
