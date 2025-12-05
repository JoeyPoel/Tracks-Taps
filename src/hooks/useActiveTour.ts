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
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
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

        if (onXpEarned) {
            onXpEarned(challenge.points);
        }

        try {
            if (userId) {
                await activeTourService.completeChallenge(activeTourId, challenge.id, userId);
                // Refresh to ensure sync (updates streak)
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

        try {
            await activeTourService.failChallenge(activeTourId, challenge.id);
            // Refresh to ensure sync (updates streak)
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

    const handlePrevStop = async () => {
        if (!activeTour) return;

        const currentStopIndex = (activeTour.currentStop || 1) - 1;
        if (currentStopIndex > 0) {
            // Optimistic update (requires store update support or just wait for refetch)
            // For now, we'll just call the API and refetch
            try {
                await activeTourService.updateCurrentStop(activeTourId, activeTour.currentStop - 1);
                fetchActiveTourById(activeTourId);
            } catch (error) {
                console.error("Failed to update current stop", error);
            }
        }
    };

    const handleNextStop = async () => {
        const currentStopIndex = (activeTour?.currentStop || 1) - 1;
        if (activeTour && activeTour.tour?.stops && currentStopIndex < activeTour.tour.stops.length - 1) {
            if (activeTour.status === 'COMPLETED') return;

            try {
                await activeTourService.updateCurrentStop(activeTourId, activeTour.currentStop + 1);
                fetchActiveTourById(activeTourId);
            } catch (error) {
                console.error("Failed to update current stop", error);
            }
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
        currentStopIndex: (activeTour?.currentStop || 1) - 1, // Convert 1-based DB to 0-based Index
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
        streak: activeTour?.streak || 0,
        points,
    };
};
