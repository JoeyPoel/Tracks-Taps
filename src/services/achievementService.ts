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
    }
};
