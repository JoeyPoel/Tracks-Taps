import { prisma } from '../../src/lib/prisma';

export const achievementService = {
    async unlockAchievement(userId: number, achievement: any) {
        // Check if already unlocked
        const existing = await prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id
                }
            },
            include: { achievement: true }
        });

        if (existing) return existing.achievement;

        console.log(`Unlocking achievement '${achievement.title}' for user ${userId}`);

        const unlocked = await prisma.userAchievement.create({
            data: {
                userId,
                achievementId: achievement.id
            },
            include: { achievement: true }
        });

        // Award XP
        if (achievement.xpReward > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: achievement.xpReward } }
            });
        }

        return unlocked.achievement;
    },

    async unlockByCriteria(userId: number, criteria: string) {
        const achievement = await prisma.achievement.findFirst({
            where: { criteria } // In our seed/schema, generic criteria is just the code string
        });

        if (!achievement) return null;
        return this.unlockAchievement(userId, achievement);
    },

    async checkTourCompletion(userId: number) {
        // Count completed tours
        const completedCount = await prisma.userPlayedTour.count({
            where: {
                userId,
                status: 'COMPLETED'
            }
        });

        // Find relevant achievements
        const achievements = await prisma.achievement.findMany({
            where: { criteria: 'TOUR_COMPLETION' }
        });

        for (const ach of achievements) {
            if (completedCount >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
    },

    async checkFriendCount(userId: number) {
        // Count accepted friendships (initiator or receiver)
        const friendsCount = await prisma.friendship.count({
            where: {
                OR: [
                    { requesterId: userId, status: 'ACCEPTED' },
                    { addresseeId: userId, status: 'ACCEPTED' }
                ]
            }
        });

        const achievements = await prisma.achievement.findMany({
            where: { criteria: 'FRIEND_ADD' }
        });

        for (const ach of achievements) {
            if (friendsCount >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
    },

    async checkPubGolf(userId: number, activeTourId: number) {
        // Get all pub golf stops for this user in this tour (via Team)
        // This is complex because PubGolfStops are linked to Team, not User directly usually, 
        // but we can find the user's team in this tour.
        const team = await prisma.team.findFirst({
            where: {
                activeTourId,
                userId
            },
            include: {
                pubGolfStops: true
            }
        });

        if (!team) return;

        // Check Hole in One (sips == 1)
        const holeInOnes = team.pubGolfStops.filter(s => s.sips === 1).length;

        if (holeInOnes > 0) {
            const hioAch = await prisma.achievement.findFirst({ where: { criteria: 'PUBGOLF_HOLE_IN_ONE' } });
            if (hioAch) await this.unlockAchievement(userId, hioAch);
        }

        // Check Streak (3 hole in ones, maybe we simplify to total count for now as per seed 'Get 3 Hole in Ones in a single game')
        // The seed said "Get 3 Hole in Ones in a single game" with criteria 'PUBGOLF_STREAK'
        if (holeInOnes >= 3) {
            const streakAch = await prisma.achievement.findFirst({ where: { criteria: 'PUBGOLF_STREAK' } });
            if (streakAch) await this.unlockAchievement(userId, streakAch);
        }
    }
};
