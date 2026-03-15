import { prisma } from '@/src/lib/prisma';
import { SessionStatus } from '@prisma/client';
import { checkBingo } from '../../src/utils/bingoUtils';
import { getScoreDetails } from '../../src/utils/pubGolfUtils';
import { activeTourRepository } from '../repositories/activeTourRepository';
import { challengeRepository } from '../repositories/challengeRepository';
import { tourRepository } from '../repositories/tourRepository';
import { userRepository } from '../repositories/userRepository';
import { achievementService } from './achievementService';

export const activeTourService = {
    async getActiveToursForUser(userId: number) {
        return await activeTourRepository.findActiveToursByUserId(userId);
    },

    async startTourWithConflictCheck(tourId: number, userId: number, force: boolean, teamName?: string, teamColor?: string, teamEmoji?: string) {
        const activeTours = await activeTourRepository.findActiveToursByUserId(userId);

        if (activeTours.length > 0) {
            if (!force) {
                const error = new Error('User already has an active tour');
                (error as any).conflict = activeTours[0];
                throw error;
            }

            // Force start: cleanup existing active tours for this user
            await Promise.all(activeTours.map(tour => activeTourRepository.deleteActiveTourById(tour.id)));
        }

        // Check if user is the author
        const tour = await tourRepository.getTourById(tourId);
        if (!tour) throw new Error("Tour not found");

        if (tour.author.id !== userId) {
            // Deduct 1 token for playing a tour IF not author
            await userRepository.deductTokens(userId, 1);
        }

        return await activeTourRepository.createActiveTour(tourId, userId, teamName, teamColor, teamEmoji);
    },

    // Keeping original startTour for backward compatibility
    async startTour(tourId: number, userId: number) {
        return await activeTourRepository.createActiveTour(tourId, userId);
    },

    // New: Join specific tour
    async joinTour(activeTourId: number, userId: number, teamName?: string, teamColor?: string, teamEmoji?: string) {
        const team = await activeTourRepository.joinActiveTour(activeTourId, userId, teamName, teamColor, teamEmoji);
        
        // Check achievements immediately on join
        const newAchievements = await achievementService.checkTeamSize(userId, activeTourId);
        
        return { ...team, newAchievements };
    },

    async getActiveTourById(id: number, userId?: number) {
        return await activeTourRepository.findActiveTourById(id, userId);
    },

    async getActiveTourProgress(id: number, userId?: number) {
        return await activeTourRepository.findActiveTourProgress(id, userId);
    },

    async getActiveTourLobby(id: number) {
        return await activeTourRepository.findActiveTourLobby(id);
    },

    async completeChallenge(activeTourId: number, challengeId: number, userId: number) {
        const challenge = await challengeRepository.findChallengeById(challengeId);

        if (!challenge) {
            throw new Error("Challenge not found");
        }

        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found for this tour");

        const newAchievements: any[] = [];

        // Check for Stop Visit achievements (Explorer)
        if (challenge.stopId) {
            const stopAchs = await achievementService.checkUniqueStops(userId);
            newAchievements.push(...stopAchs);
        }

        const updateQueries = [
            userRepository.addXp(userId, challenge.points),
            activeTourRepository.updateStreak(team.id, (team.streak || 0) + 1),
            activeTourRepository.updateTeamScore(team.id, (team.score || 0) + challenge.points),
            activeTourRepository.upsertActiveChallenge(team.id, challengeId, {
                completed: true,
                completedAt: new Date(),
            })
        ];

        await Promise.all(updateQueries);
        
        // Check for Level Up achievements
        const levelAchs = await achievementService.checkLevel(userId);
        newAchievements.push(...levelAchs);

        // Check for Bingo Progress
        await this.checkBingo(userId, activeTourId);

        // Return updated progress with new achievements
        const progress = await activeTourService.getActiveTourProgress(activeTourId, userId);
        return { ...progress, newAchievements };
    },

    async failChallenge(activeTourId: number, challengeId: number, userId: number) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found for this tour");

        // Reset streak on failure
        await activeTourRepository.updateStreak(team.id, 0);

        await activeTourRepository.upsertActiveChallenge(team.id, challengeId, {
            failed: true,
        });

        // Return updated progress
        return await activeTourService.getActiveTourProgress(activeTourId, userId);
    },

    async updateCurrentStop(activeTourId: number, currentStop: number, userId: number) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found");

        await activeTourRepository.updateCurrentStop(team.id, currentStop);

        // Return updated progress
        return await activeTourService.getActiveTourProgress(activeTourId, userId);
    },

    async deleteActiveTour(activeTourId: number) {
        return await activeTourRepository.deleteActiveTourById(activeTourId);
    },

    async finishTour(activeTourId: number, userId: number) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found");

        if (team.finishedAt) {
            console.log(`[finishTour] Team ${team.id} already finished, skipping.`);
            return { status: 'COMPLETED', tourId: (await activeTourRepository.findActiveTourById(activeTourId))?.tourId };
        }

        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (!activeTour) throw new Error("Active tour not found");

        const newAchievements: any[] = [];

        // 0. Check Pub Golf Achievements
        const pgAchs = await achievementService.checkPubGolf(userId, activeTourId);
        newAchievements.push(...pgAchs);

        // 1. Update Team as Finished
        await prisma.team.update({
            where: { id: team.id },
            data: { finishedAt: new Date() }
        });

        // 2. Create UserPlayedTour record (History)
        await prisma.userPlayedTour.create({
            data: {
                userId: userId,
                tourId: activeTour.tourId,
                status: SessionStatus.COMPLETED,
                score: team.score,
                startedAt: activeTour.createdAt,
                finishedAt: new Date(),
                teamName: team.name,
            }
        });

        // 3. Check Tour Count Achievements
        const tourAchs = await achievementService.checkTourCompletion(userId);
        newAchievements.push(...tourAchs);

        // 4. Check if all teams are finished
        const updatedActiveTour = await activeTourRepository.findActiveTourById(activeTourId);

        if (updatedActiveTour) {
            const allFinished = updatedActiveTour.teams.every(t => t.finishedAt !== null);
            if (allFinished) {
                const rankedTeams = [...updatedActiveTour.teams].sort((a, b) => b.score - a.score);
                const winnerId = rankedTeams.length > 0 ? rankedTeams[0].id : undefined;
                await activeTourRepository.updateActiveTourStatus(activeTourId, SessionStatus.POST_TOUR_LOBBY, winnerId);
            }
        }

        // Cleanup Bingo Card
        await activeTourRepository.deleteBingoCard(team.id);

        return { status: 'COMPLETED', tourId: activeTour.tourId, newAchievements };
    },

    async abandonTour(activeTourId: number, userId: number) {
        // 1. Find the team & tour
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) {
            throw new Error('Team not found for this tour');
        }

        // 2. Delete the team (Cascades will handle ActiveChallenges, BingoCard, etc.)
        await activeTourRepository.deleteTeam(team.id);

        // 3. Check if tour has any teams left
        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (activeTour && activeTour.teams.length === 0) {
            await activeTourRepository.deleteActiveTourById(activeTourId);
        }
    },

    async updatePubGolfScore(activeTourId: number, stopId: number, sips: number, userId: number) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found");

        const existingStop = await activeTourRepository.findPubGolfStop(team.id, stopId);
        const oldSips = existingStop?.sips;

        const updatedStop = await activeTourRepository.updatePubGolfScore(team.id, stopId, sips);

        const newAchievements: any[] = [];

        const par = updatedStop.stop.pubgolfPar;
        if (par !== null) {
            const oldXP = (oldSips && oldSips > 0) ? (getScoreDetails(par, oldSips)?.recommendedXP || 0) : 0;
            const newXP = (sips && sips > 0) ? (getScoreDetails(par, sips)?.recommendedXP || 0) : 0;
            const xpDiff = newXP - oldXP;

            if (xpDiff !== 0) {
                await userRepository.addXp(userId, xpDiff);
                const levelAchs = await achievementService.checkLevel(userId); 
                newAchievements.push(...levelAchs);
            }
        }

        // Check Pub Golf Achievements immediately
        const pgAchs = await achievementService.checkPubGolf(userId, activeTourId);
        newAchievements.push(...pgAchs);

        const progress = await activeTourService.getActiveTourProgress(activeTourId, userId);
        return { ...progress, newAchievements };
    },

    async updateTeamDetails(activeTourId: number, userId: number, name: string, color: string, emoji: string) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found");

        await activeTourRepository.updateTeamDetails(team.id, name, color, emoji);

        // Return updated progress
        return await activeTourService.getActiveTourProgress(activeTourId, userId);
    },

    async startTourSession(activeTourId: number, userId: number) {
        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (!activeTour) throw new Error("Active tour not found");

        // Verify host
        // Now that we set userId in createActiveTour, we can trust this check
        if (activeTour.userId !== userId) {
            throw new Error("Only the host can start the tour");
        }

        return await activeTourRepository.updateActiveTourStatus(activeTourId, SessionStatus.IN_PROGRESS);
    },

    async checkBingo(userId: number, activeTourId: number) {
        // 1. Get Team
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) return;

        // 2. Get Bingo Card
        const bingoCard = await activeTourRepository.getBingoCard(team.id);
        if (!bingoCard) return; // Not a bingo tour or no card

        // 3. Get Completed Bingo Cells directly (Optimized query)
        const cells = await activeTourRepository.getCompletedBingoCells(team.id);

        // 4. Check Logic
        const { newAwardedLines, isFullHouse } = checkBingo(cells, bingoCard.awardedLines || []);

        if (newAwardedLines.length === 0 && (!isFullHouse || bingoCard.fullHouseAwarded)) {
            return; // No change
        }

        // 5. Calculate Points
        // Standardized points: 100 per line, 250 for full house
        let pointsToAdd = 0;
        pointsToAdd += newAwardedLines.length * 100;

        if (isFullHouse && !bingoCard.fullHouseAwarded) {
            pointsToAdd += 250;
        }

        if (pointsToAdd > 0) {
            // Check if we can batch these queries
            const queries = [
                // Update Card
                activeTourRepository.updateBingoCard(
                    bingoCard.id,
                    [...(bingoCard.awardedLines || []), ...newAwardedLines],
                    isFullHouse || bingoCard.fullHouseAwarded
                ),
                // Award Points (Team Score)
                activeTourRepository.updateTeamScore(team.id, (team.score || 0) + pointsToAdd),
                // Award Points (User XP)
                userRepository.addXp(userId, pointsToAdd)
            ];

            await Promise.all(queries);
            await achievementService.checkLevel(userId);
        }
    }
};
