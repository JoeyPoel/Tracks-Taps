import NetInfo from '@react-native-community/netinfo';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { activeTourService } from '../services/activeTourService';
import { syncService } from '../services/syncService';
import { useStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { ActiveChallenge, PubGolfStop, Stop, Team } from '../types/models';
import { offlineStorage } from '../utils/offlineStorage';
import { getScoreDetails } from '../utils/pubGolfUtils';
import { triggerHaptic } from '../utils/haptics';

export const useActiveTour = (activeTourId: number, userId: number, onXpEarned?: (amount: number) => void) => {
    // Global State
    const activeTour = useStore((state) => state.activeTour);
    const storeLoading = useStore((state) => state.loadingActiveTours);
    const errorActiveTours = useStore((state) => state.errorActiveTours);
    const fetchActiveTourById = useStore((state) => state.fetchActiveTourById);
    const finishTour = useStore((state) => state.finishTour);
    const abandonTour = useStore((state) => state.abandonTour);

    const updateActiveTourLocal = useStore((state) => state.updateActiveTourLocal);
    const triggerFloatingPoints = useStore((state) => state.triggerFloatingPoints);
    const removeFloatingPoint = useStore((state) => state.removeFloatingPoint);
    const floatingPointsQueue = useStore((state) => state.floatingPointsQueue);

    // Sync Ref
    const appState = useRef(AppState.currentState);

    // Derived error state: If we have the active tour loaded locally, ignore network errors
    const isDataLoaded = activeTour?.id === activeTourId;
    const error = isDataLoaded ? null : errorActiveTours;

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

    // 3. Auto-Sync on App Resume and Network Reconnect
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('[Offline] App resumed, triggering sync...');
                syncService.syncPendingActions();
            }
            appState.current = nextAppState;
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Network State Listener
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (state.isConnected && state.isInternetReachable !== false) {
                console.log('[Offline] Network connection restored, triggering sync...');
                syncService.syncPendingActions();
            }
        });

        // Also trigger once on mount
        setTimeout(() => syncService.syncPendingActions(), 5000);

        return () => {
            subscription.remove();
            unsubscribeNetInfo();
        };
    }, []);

    // Derived loading state
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
    const [showConfetti, setShowConfetti] = useState(false);
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({});

    const { showAchievement } = useToast();

    useEffect(() => {
        setShowConfetti(false);
    }, [activeTourId]);

    const handleChallengeComplete = async (challenge: any) => {
        // Prevent actions while loading to avoid duplicate awards or race conditions
        if (loading || !currentTeam || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // 1. Optimistic update
        triggerFloatingPoints(challenge.points);
        triggerHaptic('success');
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
            const updatedProgress = await activeTourService.completeChallenge(activeTourId, challenge.id, userId);

            // Check if backend awarded extra bingo points
            const backendTeam = updatedProgress?.teams?.find((t: any) => t.id === currentTeam.id);
            if (backendTeam && updatedTeam.score !== undefined) {
                const diff = (backendTeam.score || 0) - updatedTeam.score;
                if (diff > 0) {
                    setTimeout(() => {
                        triggerFloatingPoints(diff, 'BINGO!'); // Show the bonus points animation!
                        if (onXpEarned) onXpEarned(diff);
                    }, 1000);
                }
            }

            // Trigger Achievement Toasts
            if (updatedProgress?.newAchievements && Array.isArray(updatedProgress.newAchievements)) {
                updatedProgress.newAchievements.forEach((ach: any) => showAchievement(ach));
            }

            // Sync any newly awarded bingo lines by updating the local store with response payload
            updateActiveTourLocal(updatedProgress);
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

        triggerHaptic('error');

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
                    triggerFloatingPoints(diff);
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
                const response = await activeTourService.updatePubGolfScore(activeTourId, stopId, sips, userId);
                
                // Trigger Achievement Toasts
                if (response?.newAchievements && Array.isArray(response.newAchievements)) {
                    response.newAchievements.forEach((ach: any) => showAchievement(ach));
                }
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

    // Safeguard for deleted stops (Active Tour Persistence)
    const stops = activeTour?.tour?.stops || [];
    const stopCount = stops.length;
    let safeCurrentStop = currentStop || 1;

    // If we're past the end (e.g. stops were deleted), clamp to the last stop
    if (stopCount > 0 && safeCurrentStop > stopCount) {
        safeCurrentStop = stopCount;
    }

    const currentStopIndex = Math.max(0, safeCurrentStop - 1);

    return {
        activeTour,
        loading,
        error,
        currentStopIndex,
        completedChallenges,
        failedChallenges,
        triviaSelected,
        setTriviaSelected,
        floatingPointsQueue,
        removeFloatingPoint,
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
        handleSaveSips
    };

};
