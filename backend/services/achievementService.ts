import { prisma } from '../../src/lib/prisma';
import { LevelSystem } from '../../src/utils/levelUtils';

export const achievementService = {
    /**
     * Unlocks an achievement for a user.
     * Returns the achievement object if it was NEWLY unlocked, or null if already unlocked.
     */
    async unlockAchievement(userId: number, achievement: any) {
        // Check if already unlocked
        const existing = await prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id
                }
            }
        });

        if (existing) return null;

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

            // Re-check level after achievement XP reward
            await this.checkLevel(userId);
        }

        return unlocked.achievement;
    },

    async checkLevel(userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return [];

        const calculatedLevel = LevelSystem.getLevel(user.xp);
        const newlyUnlocked: any[] = [];

        if (calculatedLevel > user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: { level: calculatedLevel }
            });
            user.level = calculatedLevel;
        }

        const achievements = await prisma.achievement.findMany({
            where: { criteria: 'LEVEL_REACH' }
        });

        for (const ach of achievements) {
            if (user.level >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
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

        const newlyUnlocked: any[] = [];
        const achievements = await prisma.achievement.findMany({
            where: {
                criteria: { in: ['TOUR_COMPLETION', 'first-tour'] }
            }
        });

        for (const ach of achievements) {
            if (completedCount >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    },

    async checkFriendCount(userId: number) {
        const friendsCount = await prisma.friendship.count({
            where: {
                OR: [
                    { requesterId: userId, status: 'ACCEPTED' },
                    { addresseeId: userId, status: 'ACCEPTED' }
                ]
            }
        });

        const newlyUnlocked: any[] = [];
        const achievements = await prisma.achievement.findMany({
            where: { criteria: 'FRIEND_ADD' }
        });

        for (const ach of achievements) {
            if (friendsCount >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    },

    async checkPubGolf(userId: number, activeTourId: number) {
        const team = await prisma.team.findFirst({
            where: {
                activeTourId,
                userId
            },
            include: {
                pubGolfStops: true
            }
        });

        if (!team) return [];

        const newlyUnlocked: any[] = [];
        const holeInOnes = team.pubGolfStops.filter(s => s.sips === 1).length;

        if (holeInOnes > 0) {
            const hioAch = await prisma.achievement.findFirst({ where: { criteria: 'PUBGOLF_HOLE_IN_ONE' } });
            if (hioAch) {
                const unlocked = await this.unlockAchievement(userId, hioAch);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }

        if (holeInOnes >= 3) {
            const streakAch = await prisma.achievement.findFirst({ where: { criteria: 'PUBGOLF_STREAK' } });
            if (streakAch) {
                const unlocked = await this.unlockAchievement(userId, streakAch);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    },



    async checkReviewCount(userId: number) {
        const count = await prisma.review.count({ where: { authorId: userId } });
        const achievements = await prisma.achievement.findMany({ where: { criteria: 'REVIEW_LEAVE' } });
        const newlyUnlocked: any[] = [];

        for (const ach of achievements) {
            if (count >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    },

    async checkCreatedToursCount(userId: number) {
        const count = await prisma.tour.count({ where: { authorId: userId } });
        const achievements = await prisma.achievement.findMany({ where: { criteria: 'creator' } });
        const newlyUnlocked: any[] = [];

        for (const ach of achievements) {
            if (count >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    },

    async checkUniqueStops(userId: number) {
        const completedChallenges = await prisma.activeChallenge.findMany({
            where: {
                completed: true,
                team: {
                    userId: userId
                }
            },
            select: {
                challenge: {
                    select: {
                        stopId: true
                    }
                }
            }
        });

        const visitedStopIds = new Set(
            completedChallenges
                .map(ac => ac.challenge.stopId)
                .filter(id => id !== null && id !== undefined)
        );

        const count = visitedStopIds.size;
        const achievements = await prisma.achievement.findMany({ where: { criteria: 'STOP_VISIT' } });
        const newlyUnlocked: any[] = [];

        for (const ach of achievements) {
            if (count >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    },

    async checkTeamSize(userId: number, activeTourId: number) {
        const team = await prisma.team.findFirst({
            where: {
                activeTourId,
                userId
            },
            include: {
                activeTour: {
                    include: {
                        teams: true
                    }
                }
            }
        });

        if (!team || !team.activeTour) return [];

        const participantCount = team.activeTour.teams.length;
        const achievements = await prisma.achievement.findMany({ where: { criteria: 'TEAM_SIZE' } });
        const newlyUnlocked: any[] = [];

        for (const ach of achievements) {
            if (participantCount >= ach.target) {
                const unlocked = await this.unlockAchievement(userId, ach);
                if (unlocked) newlyUnlocked.push(unlocked);
            }
        }
        return newlyUnlocked;
    }
};
