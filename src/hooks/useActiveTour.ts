import { useEffect, useState } from 'react';
import { activeTourService } from '../services/activeTourService';
import { useStore } from '../store/store';
import { ActiveChallenge, Team } from '../types/models';

export const useActiveTour = (activeTourId: number, userId: number, onXpEarned?: (amount: number) => void) => {
    // Global State
    const activeTour = useStore((state) => state.activeTour);
    const storeLoading = useStore((state) => state.loadingActiveTours);
    const error = useStore((state) => state.errorActiveTours);
    const fetchActiveTourById = useStore((state) => state.fetchActiveTourById);
    const finishTour = useStore((state) => state.finishTour);
    const abandonTour = useStore((state) => state.abandonTour);

    const updateActiveTourLocal = useStore((state) => state.updateActiveTourLocal);

    // Derived loading state
    const loading = storeLoading && activeTour?.id !== activeTourId;

    // Resolve Team
    const currentTeam = activeTour?.teams?.find((t: Team) => userId ? t.userId === userId : true)
        || activeTour?.teams?.[0];

    const currentStop = currentTeam?.currentStop || 1;
    const streak = currentTeam?.streak || 0;

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
            fetchActiveTourById(activeTourId, userId);
        }
    }, [activeTourId, userId, fetchActiveTourById]);

    // Sync completed and failed challenges from API (Team based)
    useEffect(() => {
        if (currentTeam?.activeChallenges) {
            const completed = new Set<number>();
            const failed = new Set<number>();
            let xp = 0;

            currentTeam.activeChallenges.forEach((ac: ActiveChallenge) => {
                if (ac.completed) {
                    completed.add(ac.challengeId);
                }
                if (ac.failed) failed.add(ac.challengeId);
            });

            setCompletedChallenges(completed);
            setFailedChallenges(failed);
            setPoints(currentTeam.score || 0);
        }
    }, [currentTeam]);

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

        if (userId) {
            // Background API call
            activeTourService.completeChallenge(activeTourId, challenge.id, userId)
                .then((updatedProgress) => updateActiveTourLocal(updatedProgress))
                .catch(err => {
                    console.error('Failed to complete challenge', err);
                    // Revert optimistic update
                    const reverted = new Set(completedChallenges);
                    reverted.delete(challenge.id);
                    setCompletedChallenges(reverted);
                });
        }
    };

    const handleChallengeFail = async (challenge: any) => {
        if (completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newFailed = new Set(failedChallenges);
        newFailed.add(challenge.id);
        setFailedChallenges(newFailed);

        if (userId) {
            // Background API call
            activeTourService.failChallenge(activeTourId, challenge.id, userId)
                .then((updatedProgress) => updateActiveTourLocal(updatedProgress))
                .catch(err => {
                    console.error('Failed to fail challenge', err);
                    // Revert
                    const reverted = new Set(failedChallenges);
                    reverted.delete(challenge.id);
                    setFailedChallenges(reverted);
                });
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

    const handlePrevStop = async () => {
        if (!currentTeam) return;

        const currentStopIndex = (currentTeam.currentStop || 1) - 1;
        if (currentStopIndex > 0) {
            const newStop = currentTeam.currentStop - 1;

            if (userId && activeTour && activeTour.teams) {
                // Optimistic Update
                const previousTeams = activeTour.teams;
                const updatedTeams = activeTour.teams.map(t =>
                    t.id === currentTeam.id ? { ...t, currentStop: newStop } : t
                );
                updateActiveTourLocal({ teams: updatedTeams });

                return activeTourService.updateCurrentStop(activeTourId, newStop, userId)
                    .then((updatedProgress) => updateActiveTourLocal(updatedProgress))
                    .catch(error => {
                        console.error("Failed to update current stop", error);
                        // Revert
                        updateActiveTourLocal({ teams: previousTeams });
                    });
            }
        }
    };

    const handleNextStop = async () => {
        if (!currentTeam) return;

        const currentStopIndex = (currentTeam.currentStop || 1) - 1;
        if (activeTour?.tour?.stops && currentStopIndex < activeTour.tour.stops.length - 1) {
            // Check tour status? Or team finish?
            if (activeTour.status === 'COMPLETED' || currentTeam.finishedAt) return;

            const newStop = currentTeam.currentStop + 1;

            if (userId && activeTour && activeTour.teams) {
                // Optimistic Update
                const previousTeams = activeTour.teams;
                const updatedTeams = activeTour.teams.map(t =>
                    t.id === currentTeam.id ? { ...t, currentStop: newStop } : t
                );
                updateActiveTourLocal({ teams: updatedTeams });

                return activeTourService.updateCurrentStop(activeTourId, newStop, userId)
                    .then((updatedProgress) => updateActiveTourLocal(updatedProgress))
                    .catch(error => {
                        console.error("Failed to update current stop", error);
                        // Revert
                        updateActiveTourLocal({ teams: previousTeams });
                    });
            }
        }
    };

    const handleFinishTour = async (): Promise<boolean> => {
        if (!userId) return false;
        try {
            await finishTour(activeTourId, userId);
            setShowConfetti(true);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleAbandonTour = async () => {
        await abandonTour(activeTourId, userId);
    };

    return {
        activeTour,
        loading,
        error,
        currentStopIndex: (currentStop || 1) - 1,
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
        updateActiveTourLocal,
        currentTeam,
    };
};
