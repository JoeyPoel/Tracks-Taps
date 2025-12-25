import { achievementRepository } from '../repositories/achievementRepository';

export const achievementController = {
    async getUserAchievements(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return Response.json({ error: 'Missing userId' }, { status: 400 });
        }

        try {
            const userAchievements = await achievementRepository.getUserAchievements(parseInt(userId));
            // Flatten structure for easier frontend consumption
            const formatted = userAchievements.map(ua => ({
                ...ua.achievement,
                unlockedAt: ua.unlockedAt
            }));

            return Response.json(formatted);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 });
        }
    }
};
