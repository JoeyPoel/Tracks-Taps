import { achievementRepository } from '../repositories/achievementRepository';
import { achievementService } from '../services/achievementService';

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

    async unlockAchievement(request: Request) {
        const body = await request.json();
        const { userId, code } = body;

        if (!userId || !code) {
            return Response.json({ error: 'Missing userId or code' }, { status: 400 });
        }

        try {
            // "code" in frontend maps to "criteria" in backend for these generic achievements
            const achievement = await achievementService.unlockByCriteria(parseInt(userId), code);

            // If checking fails or already exists (depending on service logic), implementation returns achievement
            // If service returns null (e.g. achievement doesn't exist), we handle that.
            // My service update returns the achievement if just unlocked OR existing.

            if (!achievement) {
                return Response.json({ error: 'Achievement not found' }, { status: 404 });
            }

            return Response.json(achievement);
        } catch (error) {
            console.error('Error unlocking achievement:', error);
            return Response.json({ error: 'Failed to unlock achievement' }, { status: 500 });
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
            const userUnlocked = await achievementRepository.getUserUnlockedIds(parseInt(userId));

            const unlockedMap = new Map(userUnlocked.map(ua => [ua.achievementId, ua.unlockedAt]));

            const formatted = allAchievements.map(ach => ({
                ...ach,
                unlocked: unlockedMap.has(ach.id),
                unlockedAt: unlockedMap.get(ach.id) || null
            }));

            return Response.json(formatted);
        } catch (error) {
            console.error('Error fetching all achievements:', error);
            return Response.json({ error: 'Failed to fetch achievements' }, { status: 500 });
        }
    }
};
