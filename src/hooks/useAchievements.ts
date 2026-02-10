import { useCallback, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { achievementService } from '../services/achievementService';
import { useStore } from '../store/store';

export const useAchievements = () => {
    const { user } = useUserContext();
    const {
        achievements,
        loadingAchievements,
        fetchAchievements,
        unlockAchievement: storeUnlockAchievement
    } = useStore();

    // We can keep local error state or add to store if needed. 
    // For now, simple error handling wrapper or just use console.
    const [error, setError] = useState<string | null>(null);

    const loadAchievements = useCallback(async () => {
        if (!user?.id) return [];

        try {
            await fetchAchievements(user.id);
            // Return the updated state from store
            return useStore.getState().achievements;
        } catch (err) {
            console.error('Failed to load achievements:', err);
            setError('Failed to load achievements');
            return [];
        }
    }, [user?.id, fetchAchievements]);

    const loadAllAchievements = useCallback(async () => {
        if (!user?.id) return [];
        try {
            return await achievementService.getAllAchievements(user.id);
        } catch (err) {
            console.error('Failed to load all achievements:', err);
            return [];
        }
    }, [user?.id]);

    const unlockAchievement = useCallback(async (code: string) => {
        if (!user?.id) return null;

        try {
            return await storeUnlockAchievement(user.id, code);
        } catch (err) {
            console.error('Failed to unlock achievement:', err);
        }
        return null;
    }, [user?.id, storeUnlockAchievement]);

    return {
        achievements,
        loading: loadingAchievements,
        error,
        loadAchievements,
        loadAllAchievements,
        unlockAchievement
    };
};
