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
            const formatted = userAchievements.map(ua => ({
                ...ua.achievement,
                unlockedAt: ua.unlockedAt
            }));

            return Response.json(formatted);
        } catch (error) {
            console.error('Error fetching achievements:', error);
            return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 });
        }
    },

    async getAllWithProgress(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return Response.json({ error: 'Missing userId' }, { status: 400 });
        }

        try {
            const allAchievements = await achievementRepository.getAllAchievements();
            const userAchievements = await achievementRepository.getUserAchievements(parseInt(userId));

            const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

            const formatted = allAchievements.map(ach => ({
                ...ach,
                unlocked: unlockedIds.has(ach.id),
                unlockedAt: userAchievements.find(ua => ua.achievementId === ach.id)?.unlockedAt || null
            }));

            return Response.json(formatted);
        } catch (error) {
            console.error('Error fetching all achievements:', error);
            return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 });
        }
    }
};
