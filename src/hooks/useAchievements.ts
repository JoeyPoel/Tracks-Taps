import { useCallback, useState } from 'react';
import { useUserContext } from '../context/UserContext';
import { Achievement, achievementService } from '../services/achievementService';

export const useAchievements = () => {
    const { user } = useUserContext();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAchievements = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);
        try {
            const data = await achievementService.getUserAchievements(user.id);
            setAchievements(data);
        } catch (err) {
            console.error('Failed to load achievements:', err);
            setError('Failed to load achievements');
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

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
        if (!user?.id) return;

        try {
            const achievement = await achievementService.unlockAchievement(user.id, code);
            if (achievement) {
                // Return details for toast to be handled by caller or handle here if we pass toast context
                return achievement;
            }
        } catch (err) {
            console.error('Failed to unlock achievement:', err);
        }
        return null;
    }, [user?.id]);

    return {
        achievements,
        loading,
        error,
        loadAchievements,
        loadAllAchievements,
        unlockAchievement
    };
};
