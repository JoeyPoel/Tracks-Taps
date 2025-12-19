import { useCallback, useState } from 'react';
import { activeTourService } from '../services/activeTourService';

export const usePreTourLobby = (activeTourId: number | null, user: any) => {
    // Local State
    const [activeTour, setActiveTour] = useState<any>(null);
    const [userTeam, setUserTeam] = useState<any>(null);

    const loadLobbyDetails = useCallback(async () => {
        if (!activeTourId || !user) return;
        try {
            const tour = await activeTourService.getActiveTourById(activeTourId);
            setActiveTour(tour);

            if (tour && tour.teams) {
                const team = tour.teams.find((t: any) => t.userId === user?.id);
                setUserTeam(team);
            }
        } catch (error) {
            console.error('Failed to load lobby details', error);
        }
    }, [activeTourId, user]);

    return {
        activeTour,
        userTeam,
        loadLobbyDetails
    };
};
