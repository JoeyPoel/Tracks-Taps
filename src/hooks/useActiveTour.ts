import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { activeTourService } from '../services/activeTourService';
import { syncService } from '../services/syncService';
import { useStore } from '../store/store';
import { ActiveChallenge, PubGolfStop, Stop, Team } from '../types/models';
import { offlineStorage } from '../utils/offlineStorage';
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

    // Sync Ref
    const appState = useRef(AppState.currentState);

    // 1. Initial Load (Offline -> Online)
    useEffect(() => {
        const load = async () => {
            // Create a temporary loading state locally if needed, but store handles it.
            // Try load from offline first
            if (activeTourId) {
                const cached = await offlineStorage.getActiveTour(activeTourId);
                if (cached) {
                    console.log('[Offline] Loaded active tour from storage');
                    updateActiveTourLocal(cached);
                }

                // Then fetch fresh data
                fetchActiveTourById(activeTourId, userId);
            }
        };
        load();
    }, [activeTourId, userId, fetchActiveTourById]);

    // 2. Persist State on Change
    useEffect(() => {
        if (activeTour && activeTour.id === activeTourId) {
            offlineStorage.saveActiveTour(activeTour).catch(console.error);
        }
    }, [activeTour, activeTourId]);

    // 3. Auto-Sync on App Resume
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('[Offline] App resumed, triggering sync...');
                syncService.syncPendingActions();
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Also trigger once on mount
        setTimeout(() => syncService.syncPendingActions(), 5000);

        return () => {
            subscription.remove();
        };
    }, []);

    // Derived loading state
    const isDataLoaded = activeTour?.id === activeTourId;
    const loading = !isDataLoaded && (storeLoading || !activeTour || !error);

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
    }, [activeTourId]);

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
    };

    const handleChallengeComplete = async (challenge: any) => {
        // Prevent actions while loading to avoid duplicate awards or race conditions
        if (loading || !currentTeam || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // 1. Optimistic update
        triggerFloatingPoints(challenge.points);
        if (onXpEarned) {
            onXpEarned(challenge.points);
        }

        const optimisticChallenge: ActiveChallenge = {
            id: -Date.now(), // Temp ID
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
            await activeTourService.completeChallenge(activeTourId, challenge.id, userId);
        } catch (err) {
            console.warn('[Offline] Failed to complete challenge, queuing action.', err);
            // Don't revert, assume success offline
            await offlineStorage.addAction({
                type: 'COMPLETE_CHALLENGE',
                activeTourId,
                payload: { challengeId: challenge.id, userId }
            });
        }
    };

    const handleChallengeFail = async (challenge: any) => {
        if (!currentTeam || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        const optimisticChallenge: ActiveChallenge = {
            id: -Date.now(),
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
            await activeTourService.failChallenge(activeTourId, challenge.id, userId);
        } catch (err) {
            console.warn('[Offline] Failed to fail challenge, queuing action.', err);
            await offlineStorage.addAction({
                type: 'FAIL_CHALLENGE',
                activeTourId,
                payload: { challengeId: challenge.id, userId }
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
            await activeTourService.updateCurrentStop(activeTourId, newStop, userId);
        } catch (error) {
            console.warn("[Offline] Failed to update current stop, queuing action", error);
            await offlineStorage.addAction({
                type: 'UPDATE_CURRENT_STOP',
                activeTourId,
                payload: { currentStop: newStop, userId }
            });
        }
    }

    const handleSaveSips = async (stopId: number, sips: number) => {
        if (loading || !currentTeam) return;

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

        // If not found, add it
        if (!updatedPubGolfStops.find((pg: any) => pg.stopId === stopId)) {
            updatedPubGolfStops.push({ stopId, sips, teamId: currentTeam.id });
        }

        const updatedTeam = { ...currentTeam, pubGolfStops: updatedPubGolfStops };
        const previousTeams = activeTour?.teams || [];

        updateActiveTourLocal({ teams: [updatedTeam] });

        if (userId) {
            try {
                await activeTourService.updatePubGolfScore(activeTourId, stopId, sips, userId);
            } catch (error) {
                console.warn("[Offline] Failed to save sips, queuing action:", error);
                await offlineStorage.addAction({
                    type: 'UPDATE_PUB_GOLF',
                    activeTourId,
                    payload: { stopId, sips, userId }
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
            console.warn('[Offline] Failed to finish tour, queuing action', e);
            await offlineStorage.addAction({
                type: 'FINISH_TOUR',
                activeTourId,
                payload: { userId }
            });
            setShowConfetti(true); // Assume success
            return true; // Assume success
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
