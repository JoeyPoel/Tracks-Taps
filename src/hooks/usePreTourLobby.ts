import { supabase } from '@/utils/supabase';
import { useCallback, useEffect, useRef, useState } from 'react';
import { activeTourService } from '../services/activeTourService';

export const usePreTourLobby = (activeTourId: number | null, user: any) => {
    // Local State
    const [activeTour, setActiveTour] = useState<any>(null);
    const [userTeam, setUserTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);

    const initialized = useRef(false);
    const userId = user?.id; // Stabilize dependency

    const loadLobbyDetails = useCallback(async (background = false) => {
        if (!activeTourId || !userId) return;

        // Use ref to check if initialized, avoiding state dependency loop
        const isBackground = background || initialized.current;

        try {
            if (!isBackground) setLoading(true);
            console.log(`[Lobby] Loading details for tour ${activeTourId}...`);
            const tour = await activeTourService.getActiveTourLobby(activeTourId);
            setActiveTour(tour);

            if (tour && tour.teams) {
                const team = tour.teams.find((t: any) => String(t.userId) === String(userId));
                setUserTeam(team);
            }
        } catch (error) {
            console.error('[Lobby] Failed to load details', error);
        } finally {
            if (!isBackground) setLoading(false);
            initialized.current = true;
        }
    }, [activeTourId, userId]);

    // Initial Load & Realtime Subscription
    useEffect(() => {
        if (!activeTourId || !userId) return;

        loadLobbyDetails();

        console.log(`[Lobby] Subscribing to channel lobby_${activeTourId}`);
        const channel = supabase.channel(`lobby_${activeTourId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ActiveTour', filter: `id=eq.${activeTourId}` },
                (payload) => {
                    console.log('[Realtime] ActiveTour updated:', payload);
                    loadLobbyDetails(true);
                }
            )
            // Listen to "Team" (PascalCase - standard Prisma)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Team', filter: `activeTourId=eq.${activeTourId}` },
                (payload) => {
                    console.log('[Realtime] Team updated (Pascal):', payload);
                    loadLobbyDetails(true);
                }
            )
            // Listen to "team" (lowercase - standard Postgres) just in case
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'team', filter: `activeTourId=eq.${activeTourId}` },
                (payload) => {
                    console.log('[Realtime] Team updated (lower):', payload);
                    loadLobbyDetails(true);
                }
            )
            // Listen for explicit broadcast events for "smart" updates
            .on('broadcast', { event: 'lobby_update' }, () => {
                console.log('[Realtime] Broadcast received: lobby_update');
                loadLobbyDetails(true);
            })
            .subscribe((status, err) => {
                console.log(`[Realtime] Subscription status for lobby_${activeTourId}:`, status, err);
            });

        return () => {
            console.log(`[Lobby] Unsubscribing from lobby_${activeTourId}`);
            supabase.removeChannel(channel);
        };
    }, [activeTourId, userId, loadLobbyDetails]);

    const startTour = async () => {
        if (!activeTourId || !userId) return;
        try {
            setIsStarting(true);
            await activeTourService.startGame(activeTourId, userId);

            // Send a broadcast to ensure everyone updates instantly
            await supabase.channel(`lobby_${activeTourId}`).send({
                type: 'broadcast',
                event: 'lobby_update',
                payload: { status: 'IN_PROGRESS' }
            });

            // WebSocket will handle the redirect via activeTour.status change
            loadLobbyDetails(true);
            return { success: true };
        } catch (error: any) {
            console.error('Failed to start tour', error);
            setIsStarting(false);
            return { success: false, error: error.message || 'Network error' };
        }
    };

    return {
        activeTour,
        userTeam,
        loading,
        isStarting,
        loadLobbyDetails,
        startTour
    };
};
