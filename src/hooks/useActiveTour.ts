import { useEffect, useMemo, useState } from 'react';
import { activeTourService } from '../services/activeTourService';
import { useStore } from '../store/store';
import { ActiveChallenge, PubGolfStop, Stop, Team } from '../types/models';
import { getScoreDetails } from '../utils/pubGolfUtils';

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
    // Robust Logic: 
    // 1. If we have the CORRECT tour data loaded, we are NOT loading (even if background refreshing).
    // 2. If we do NOT have the correct tour data, we ARE loading (unless there is an error).
    const isDataLoaded = activeTour?.id === activeTourId;
    const loading = !isDataLoaded && (storeLoading || !activeTour || !error);
    // Note: !error check ensures we don't get stuck in loading if there is an error.
    // However, if !isDataLoaded and !error, we default to loading (initial state).

    // Resolve Team
    const currentTeam = useMemo(() =>
        activeTour?.teams?.find((t: Team) => userId ? t.userId === userId : true)
        || activeTour?.teams?.[0],
        [activeTour, userId]);

    const currentStop = currentTeam?.currentStop || 1;
    const streak = currentTeam?.streak || 0;

    const pubGolfXP = useMemo(() => {
        const stops = activeTour?.tour?.stops as Stop[] | undefined;
        const pgStops = currentTeam?.pubGolfStops as PubGolfStop[] | undefined;

        if (!pgStops || !stops) return 0;

        return pgStops.reduce((total: number, pgStop: PubGolfStop) => {
            const stop = stops.find((s: Stop) => s.id === pgStop.stopId);
            // Ensure we have a valid stop, par, and played sips
            if (!stop || typeof stop.pubgolfPar !== 'number' || !pgStop.sips || pgStop.sips <= 0) return total;

            const details = getScoreDetails(stop.pubgolfPar, pgStop.sips);
            return total + (details?.recommendedXP || 0);
        }, 0);
    }, [currentTeam, activeTour]);

    const points = (currentTeam?.score || 0) + pubGolfXP;

    // Derived Challenge State
    const { completedChallenges, failedChallenges } = useMemo(() => {
        const completed = new Set<number>();
        const failed = new Set<number>();

        if (currentTeam?.activeChallenges) {
            currentTeam.activeChallenges.forEach((ac: ActiveChallenge) => {
                if (ac.completed) completed.add(ac.challengeId);
                if (ac.failed) failed.add(ac.challengeId);
            });
        }
        return { completedChallenges: completed, failedChallenges: failed };
    }, [currentTeam]);

    // Local UI State (Visuals only)
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        setShowConfetti(false);
        if (activeTourId) {
            fetchActiveTourById(activeTourId, userId);
        }
    }, [activeTourId, userId, fetchActiveTourById]);

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
    };

    const handleChallengeComplete = async (challenge: any) => {
        if (!currentTeam || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // 1. Optimistic update
        triggerFloatingPoints(challenge.points);
        if (onXpEarned) {
            onXpEarned(challenge.points);
        }

        const optimisticChallenge: ActiveChallenge = {
            id: -1, // Temp ID
            teamId: currentTeam.id,
            challengeId: challenge.id,
            completed: true,
            failed: false,
            completedAt: new Date(),
        };

        const updatedTeam: Team = {
            ...currentTeam,
            score: (currentTeam.score || 0) + challenge.points,
            streak: (currentTeam.streak || 0) + 1,
            activeChallenges: [...(currentTeam.activeChallenges || []), optimisticChallenge]
        };

        const previousTeams = activeTour?.teams || [];
        updateActiveTourLocal({ teams: [updatedTeam] });

        try {
            // FIRE AND FORGET - We trust our local state
            await activeTourService.completeChallenge(activeTourId, challenge.id, userId);
        } catch (err) {
            console.error('Failed to complete challenge', err);
            // Revert on error
            updateActiveTourLocal({ teams: previousTeams });
        }
    };

    const handleChallengeFail = async (challenge: any) => {
        if (!currentTeam || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        const optimisticChallenge: ActiveChallenge = {
            id: -1,
            teamId: currentTeam.id,
            challengeId: challenge.id,
            completed: false,
            failed: true,
            completedAt: null,
        };

        const updatedTeam: Team = {
            ...currentTeam,
            streak: 0, // Reset streak
            activeChallenges: [...(currentTeam.activeChallenges || []), optimisticChallenge]
        };

        const previousTeams = activeTour?.teams || [];
        updateActiveTourLocal({ teams: [updatedTeam] });

        try {
            // FIRE AND FORGET
            await activeTourService.failChallenge(activeTourId, challenge.id, userId);
        } catch (err) {
            console.error('Failed to fail challenge', err);
            // Revert
            updateActiveTourLocal({ teams: previousTeams });
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
        const newStop = currentTeam.currentStop - 1;
        if (newStop < 1) return;

        performStopUpdate(newStop);
    };

    const handleNextStop = async () => {
        if (!currentTeam || !activeTour?.tour?.stops) return;

        // Check bounds
        if (currentTeam.currentStop >= activeTour.tour.stops.length) return;
        if (activeTour.status === 'COMPLETED' || currentTeam.finishedAt) return;

        const newStop = currentTeam.currentStop + 1;
        performStopUpdate(newStop);
    };

    const performStopUpdate = async (newStop: number) => {
        if (!currentTeam) return;

        // 1. Optimistic Update
        const optimisticTeam: Team = {
            ...currentTeam,
            currentStop: newStop
        };
        const previousTeams = activeTour?.teams || [];
        updateActiveTourLocal({ teams: [optimisticTeam] });

        try {
            // FIRE AND FORGET
            await activeTourService.updateCurrentStop(activeTourId, newStop, userId);
        } catch (error) {
            console.error("Failed to update current stop", error);
            // Revert
            updateActiveTourLocal({ teams: previousTeams });
        }
    }

    const handleSaveSips = async (stopId: number, sips: number) => {
        if (!currentTeam) return;

        // Optimistic update via Store
        const updatedPubGolfStops = currentTeam.pubGolfStops?.map((pg: any) =>
            pg.stopId === stopId ? { ...pg, sips } : pg
        ) || [];

        // XP Calculation
        const stop = activeTour?.tour?.stops?.find((s: any) => s.id === stopId);
        if (stop && stop.pubgolfPar) {
            const par = stop.pubgolfPar;
            const existingEntry = currentTeam.pubGolfStops?.find((pg: any) => pg.stopId === stopId);
            const oldSips = existingEntry ? existingEntry.sips : 0;

            const oldXP = (oldSips && oldSips > 0) ? (getScoreDetails(par, oldSips)?.recommendedXP || 0) : 0;
            const newXP = (sips && sips > 0) ? (getScoreDetails(par, sips)?.recommendedXP || 0) : 0;

            const diff = newXP - oldXP;
            if (diff !== 0 && onXpEarned) {
                onXpEarned(diff);
                if (diff > 0) {
                    setFloatingPointsAmount(diff);
                    setShowFloatingPoints(true);
                }
            }
        }

        // If not found, add it? (Logic implies it exists from seed, but strictly might need to create)
        if (!updatedPubGolfStops.find((pg: any) => pg.stopId === stopId)) {
            updatedPubGolfStops.push({ stopId, sips, teamId: currentTeam.id });
        }

        const updatedTeam = { ...currentTeam, pubGolfStops: updatedPubGolfStops };
        const previousTeams = activeTour?.teams || [];

        updateActiveTourLocal({ teams: [updatedTeam] });

        if (userId) {
            try {
                // FIRE AND FORGET
                await activeTourService.updatePubGolfScore(activeTourId, stopId, sips, userId);
            } catch (error) {
                console.error("Failed to save sips:", error);
                // Revert
                updateActiveTourLocal({ teams: previousTeams });
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
        setFloatingPointsAmount,
        handleSaveSips
    };
};
