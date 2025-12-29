import { supabase } from '@/utils/supabase';
import { useCallback, useEffect, useState } from 'react';
import { activeTourService } from '../services/activeTourService';

export const usePreTourLobby = (activeTourId: number | null, user: any) => {
    // Local State
    const [activeTour, setActiveTour] = useState<any>(null);
    const [userTeam, setUserTeam] = useState<any>(null);

    const loadLobbyDetails = useCallback(async () => {
        if (!activeTourId || !user) return;
        try {
            const tour = await activeTourService.getActiveTourLobby(activeTourId);
            setActiveTour(tour);

            if (tour && tour.teams) {
                const team = tour.teams.find((t: any) => t.userId === user?.id);
                setUserTeam(team);
            }
        } catch (error) {
            console.error('Failed to load lobby details', error);
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
                    loadLobbyDetails();
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'Team', filter: `activeTourId=eq.${activeTourId}` },
                () => {
                    console.log('Realtime: Team updated');
                    loadLobbyDetails();
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
            await activeTourService.startGame(activeTourId);
            // WebSocket will handle the redirect via activeTour.status change
            // But we reload to be sure
            loadLobbyDetails();
            return { success: true };
        } catch (error: any) {
            console.error('Failed to start tour', error);
            return { success: false, error: error.message || 'Network error' };
        }
    };

    return {
        activeTour,
        userTeam,
        loadLobbyDetails,
        startTour
    };
};
