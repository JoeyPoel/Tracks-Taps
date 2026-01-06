import { prisma } from '../../src/lib/prisma';
import { LevelSystem } from '../../src/utils/levelUtils';

export const achievementService = {
    async unlockAchievement(userId: number, achievement: any) {
        // ... (existing unlock logic)
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
            // Note: This calls update which might trigger checkLevel recursion if we aren't careful.
            // But checkLevel is called FROM addXp usually. 
            // Here we just increment. We should probably verify level again? 
            // For safety, let's just increment. 
            await prisma.user.update({
                where: { id: userId },
                data: { xp: { increment: achievement.xpReward } }
            });

            // Re-check level after achievement XP reward?
            // Yes, gaining an achievement could level you up.
            await this.checkLevel(userId);
        }

        return unlocked.achievement;
    },

    async checkLevel(userId: number) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return;

        const calculatedLevel = LevelSystem.getLevel(user.xp);

        if (calculatedLevel > user.level) {
            await prisma.user.update({
                where: { id: userId },
                data: { level: calculatedLevel }
            });
            user.level = calculatedLevel; // Update local var for check
        }

        const achievements = await prisma.achievement.findMany({
            where: { criteria: 'LEVEL_REACH' }
        });

        for (const ach of achievements) {
            if (user.level >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
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
            where: {
                criteria: { in: ['TOUR_COMPLETION', 'first-tour'] }
            }
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
    },



    async checkReviewCount(userId: number) {
        const count = await prisma.review.count({ where: { authorId: userId } });
        const achievements = await prisma.achievement.findMany({ where: { criteria: 'REVIEW_LEAVE' } });

        for (const ach of achievements) {
            if (count >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
    },

    async checkCreatedToursCount(userId: number) {
        const count = await prisma.tour.count({ where: { authorId: userId } });
        const achievements = await prisma.achievement.findMany({ where: { criteria: 'creator' } });

        for (const ach of achievements) {
            if (count >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
    },

    async checkUniqueStops(userId: number) {
        // Find all completed challenges for this user across all teams
        // This acts as a proxy for "Visiting a Stop"
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

        // Extract unique stop IDs (filter out null stopIds if any)
        const visitedStopIds = new Set(
            completedChallenges
                .map(ac => ac.challenge.stopId)
                .filter(id => id !== null && id !== undefined)
        );

        const count = visitedStopIds.size;

        const achievements = await prisma.achievement.findMany({ where: { criteria: 'STOP_VISIT' } });

        for (const ach of achievements) {
            if (count >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
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

        if (!team || !team.activeTour) return;

        const participantCount = team.activeTour.teams.length;

        const achievements = await prisma.achievement.findMany({ where: { criteria: 'TEAM_SIZE' } });

        for (const ach of achievements) {
            if (participantCount >= ach.target) {
                await this.unlockAchievement(userId, ach);
            }
        }
    }
};
