import { useEffect, useState } from 'react';
import { useFetch } from './useFetch';

export const useActiveTour = (activeTourId: number) => {
    const [points, setPoints] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    // Fetch active tour data
    const { data: activeTour, loading, error } = useFetch<any>(`/api/active-tour/${activeTourId}`);

    // Local state for immediate UI updates before refetch/sync
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [failedChallenges, setFailedChallenges] = useState<Set<number>>(new Set());
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({}); // challengeId -> selectedIndex

    // Sync completed and failed challenges from API and calculate current stop
    useEffect(() => {
        if (activeTour?.activeChallenges && activeTour?.tour?.stops) {
            const completed = new Set<number>();
            const failed = new Set<number>();

            activeTour.activeChallenges.forEach((ac: any) => {
                if (ac.completed) completed.add(ac.challengeId);
                if (ac.failed) failed.add(ac.challengeId);
            });

            setCompletedChallenges(completed);
            setFailedChallenges(failed);

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

        checkAutoAdvance(newCompleted, failedChallenges);

        try {
            await fetch('/api/active-challenge/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTourId,
                    challengeId: challenge.id
                })
            });
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

        checkAutoAdvance(completedChallenges, newFailed);

        try {
            await fetch('/api/active-challenge/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTourId,
                    challengeId: challenge.id
                })
            });
        } catch (err) {
            console.error('Failed to fail challenge', err);
        }
    };

    const handleClaimArrival = (challenge: any) => {
        handleChallengeComplete(challenge);
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

    const handleFinishTour = () => {
        setShowConfetti(true);
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
        handleClaimArrival,
        handleSubmitTrivia,
        handlePrevStop,
        handleNextStop,
        handleFinishTour,
    };
};
