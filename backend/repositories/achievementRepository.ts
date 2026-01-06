import { prisma } from '../../src/lib/prisma';

export const achievementRepository = {
    async getUserUnlockedIds(userId: number) {
        return await prisma.userAchievement.findMany({
            where: { userId },
            select: {
                achievementId: true,
                unlockedAt: true
            }
        });
    },

    async getUserAchievements(userId: number) {
        return await prisma.userAchievement.findMany({
            where: { userId },
            select: {
                unlockedAt: true,
                achievement: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        icon: true,
                        color: true,
                        xpReward: true,
                        criteria: true,
                        target: true
                    }
                }
            },
            orderBy: { unlockedAt: 'desc' }
        });
    },

    async getAllAchievements() {
        return await prisma.achievement.findMany();
    }
};
