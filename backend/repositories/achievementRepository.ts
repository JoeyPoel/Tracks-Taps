import { prisma } from '../../src/lib/prisma';

export const achievementRepository = {
    async getUserAchievements(userId: number) {
        return await prisma.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true
            },
            orderBy: { unlockedAt: 'desc' }
        });
    },

    async getAllAchievements() {
        return await prisma.achievement.findMany();
    }
};
