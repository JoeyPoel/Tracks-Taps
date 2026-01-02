import { supabase } from '@/utils/supabase';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useStore } from '../store/store';

export const useWaitingLobby = (activeTourId: number) => {
    const { theme } = useTheme();
    const router = useRouter();
    const { activeTour, user, fetchActiveTourLobby } = useStore();

    useEffect(() => {
        if (!activeTourId) return;

        const fetchData = async () => {
            await fetchActiveTourLobby(activeTourId);
        };

        fetchData();

        const channel = supabase
            .channel(`team_updates_${activeTourId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'Team',
                    filter: `activeTourId=eq.${activeTourId}`,
                },
                (payload) => {
                    console.log('Realtime Team update received:', payload);
                    fetchActiveTourLobby(activeTourId);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeTourId, fetchActiveTourLobby]);

    const currentTeams = activeTour?.id === activeTourId ? (activeTour.teams || []) : [];
    const userTeam = currentTeams.find(t => t.userId === user?.id) || null;

    const finishedCount = currentTeams.filter(t => t.finishedAt).length;
    const totalTeamCount = currentTeams.length;

    const handleViewResults = () => {
        router.replace({ pathname: '/tour-completed/[id]', params: { id: activeTourId, celebrate: 'true' } });
    };

    const progressPercentage = totalTeamCount > 0 ? (finishedCount / totalTeamCount) * 100 : 0;

    return {
        teams: currentTeams,
        userTeam,
        finishedCount,
        totalTeamCount,
        activeTour,
        progressPercentage,
        handleViewResults
    };
};
