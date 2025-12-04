import { useEffect, useState } from 'react';
import { activeTourService } from '../services/activeTourService';
import { useStore } from '../store/store';

export const useActiveTour = (activeTourId: number, userId?: number, onXpEarned?: (amount: number) => void) => {
    // Global State
    const activeTour = useStore((state) => state.activeTour);
    const storeLoading = useStore((state) => state.loadingActiveTours);
    const error = useStore((state) => state.errorActiveTours);
    const fetchActiveTourById = useStore((state) => state.fetchActiveTourById);
    const finishTour = useStore((state) => state.finishTour);
    const abandonTour = useStore((state) => state.abandonTour);
    const addXp = useStore((state) => state.addXp);

    // Derived loading state: Only show loading if we don't have the correct active tour data
    // This allows background refetches (where storeLoading is true but activeTour is present) without unmounting UI
    const loading = storeLoading && activeTour?.id !== activeTourId;

    // Local UI State
    const [points, setPoints] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [failedChallenges, setFailedChallenges] = useState<Set<number>>(new Set());
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        if (activeTourId) {
            fetchActiveTourById(activeTourId);
        }
    }, [activeTourId, fetchActiveTourById]);

    // Sync completed and failed challenges from API
    useEffect(() => {
        if (activeTour?.activeChallenges) {
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
            activeTour?.tour?.stops?.forEach((stop: any) => {
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
                    break;
                }
            }
            setStreak(currentStreak);
        }
    }, [activeTour]);

    // Initialize Current Stop Index only once
    useEffect(() => {
        if (activeTour?.tour?.stops && currentStopIndex === 0 && completedChallenges.size > 0) {
            let calculatedIndex = 0;
            const stops = activeTour.tour.stops;
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                const allChallengesDone = (stop.challenges || []).every((c: any) => completedChallenges.has(c.id) || failedChallenges.has(c.id));
                if (!allChallengesDone) {
                    calculatedIndex = i;
                    break;
                }
                if (i === stops.length - 1 && allChallengesDone) {
                    calculatedIndex = i;
                }
            }
            // Only update if we are still at 0 (initial load) to avoid overriding user navigation
            setCurrentStopIndex(calculatedIndex);
        }
    }, [activeTour?.tour?.stops, completedChallenges.size]); // Depend on size to trigger once loaded

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

        // Removed duplicate addXp(challenge.points) call here

        try {
            if (userId) {
                await activeTourService.completeChallenge(activeTourId, challenge.id, userId);
                // Refresh to ensure sync
                fetchActiveTourById(activeTourId);
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
            // Refresh to ensure sync
            fetchActiveTourById(activeTourId);
        } catch (err) {
            console.error('Failed to fail challenge', err);
        }
    };

    const handleSubmitTrivia = (challenge: any) => {
        const selectedIndex = triviaSelected[challenge.id];
        if (selectedIndex === undefined || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        const selectedOption = challenge.options[selectedIndex];
        console.log(`Trivia Check: Selected '${selectedOption}' vs Answer '${challenge.answer}'`);
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
        if (activeTour && activeTour.tour?.stops && currentStopIndex < activeTour.tour.stops.length - 1) {
            // Prevent going to next stop if tour is completed (optional, based on user request)
            // But usually you can review a completed tour. The user specifically asked for this fix though.
            if (activeTour.status === 'COMPLETED') return;

            setCurrentStopIndex(prev => prev + 1);
        }
    };

    const handleFinishTour = async (): Promise<boolean> => {
        const success = await finishTour(activeTourId);
        if (success) {
            setShowConfetti(true);
            return true;
        }
        return false;
    };

    const handleAbandonTour = async () => {
        await abandonTour(activeTourId);
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
