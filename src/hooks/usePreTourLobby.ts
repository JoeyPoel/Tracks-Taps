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

    const loadLobbyDetails = useCallback(async (background = false) => {
        if (!activeTourId || !user) return;

        // Use ref to check if initialized, avoiding state dependency loop
        const isBackground = background || initialized.current;

        try {
            if (!isBackground) setLoading(true);
            const tour = await activeTourService.getActiveTourLobby(activeTourId);
            setActiveTour(tour);

            if (tour && tour.teams) {
                const team = tour.teams.find((t: any) => String(t.userId) === String(user?.id));
                setUserTeam(team);
            }
        } catch (error) {
            console.error('Failed to load lobby details', error);
        } finally {
            if (!isBackground) setLoading(false);
            initialized.current = true;
        }
    }, [activeTourId, user]);

    // Initial Load & Realtime Subscription
    useEffect(() => {
        if (!activeTourId || !user) return;

        loadLobbyDetails();

        const channel = supabase.channel(`lobby_${activeTourId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'ActiveTour', filter: `id=eq.${activeTourId}` },
                () => {
                    console.log('Realtime: ActiveTour updated');
                    loadLobbyDetails(true);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Team', filter: `activeTourId=eq.${activeTourId}` },
                () => {
                    console.log('Realtime: Team updated');
                    loadLobbyDetails(true);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTourId, user, loadLobbyDetails]);

    const startTour = async () => {
        if (!activeTourId || !user) return;
        try {
            setIsStarting(true);
            await activeTourService.startGame(activeTourId, user.id);
            // WebSocket will handle the redirect via activeTour.status change
            // But we reload to be sure
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
