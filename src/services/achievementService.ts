import client from '@/src/api/apiClient';

export interface Achievement {
    id: number | string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlockedAt?: string;
    criteria?: string;
    target?: number;
    xpReward?: number;
}

export const achievementService = {
    async getUserAchievements(userId: number): Promise<Achievement[]> {
        const response = await client.get(`/user/achievements`, {
            params: { userId }
        });
        return response.data;
    },

    async getAllAchievements(userId: number): Promise<(Achievement & { unlocked: boolean })[]> {
        const response = await client.get(`/user/achievements/all`, {
            params: { userId }
        });
        return response.data;
    },

    async unlockAchievement(userId: number, code: string): Promise<Achievement | null> {
        try {
            const response = await client.post(`/user/achievements/unlock`, {
                userId,
                code
            });
            // Assuming backend returns the achievement object if unlocked, or null/status if already unlocked
            return response.data;
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            // Return null or rethrow depending on desired behavior.
            // If already unlocked, backend might return 400 or specific code.
            // For now, let's return null on failure to unlock.
            return null;
        }
    }
};
