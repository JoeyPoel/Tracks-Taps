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

    return {
        achievements,
        loading,
        error,
        loadAchievements,
    };
};
