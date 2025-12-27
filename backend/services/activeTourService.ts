import { prisma } from '@/src/lib/prisma';
import { SessionStatus } from '@prisma/client';
import { getScoreDetails } from '../../src/utils/pubGolfUtils';
import { activeTourRepository } from '../repositories/activeTourRepository';
import { challengeRepository } from '../repositories/challengeRepository';
import { tourRepository } from '../repositories/tourRepository';
import { userRepository } from '../repositories/userRepository';

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

        if (tour.authorId !== userId) {
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
        // Check if already in it needed?
        return await activeTourRepository.joinActiveTour(activeTourId, userId, teamName, teamColor, teamEmoji);
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

        await userRepository.addXp(userId, challenge.points);

        // Update Team streak and score
        await activeTourRepository.updateStreak(team.id, (team.streak || 0) + 1);
        await activeTourRepository.updateTeamScore(team.id, (team.score || 0) + challenge.points);

        const updateResult = await activeTourRepository.upsertActiveChallenge(team.id, challengeId, {
            completed: true,
            completedAt: new Date(),
        });

        // Return updated progress
        return await activeTourService.getActiveTourProgress(activeTourId, userId);
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

        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (!activeTour) throw new Error("Active tour not found");

        // 1. Create UserPlayedTour record
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

        // 2. Delete the team (cascades to ActiveChallenges, PubGolfStops)
        await activeTourRepository.deleteTeam(team.id);

        // 3. Check if any teams remain
        const updatedActiveTour = await activeTourRepository.findActiveTourById(activeTourId);

        if (!updatedActiveTour || updatedActiveTour.teams.length === 0) {
            await activeTourRepository.deleteActiveTourById(activeTourId);
            return { status: 'COMPLETED', tourId: activeTour.tourId };
        }

        return { status: 'COMPLETED', tourId: activeTour.tourId };
    },

    async abandonTour(activeTourId: number, userId: number) {
        // 1. Find the team & tour
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) {
            throw new Error('Team not found for this tour');
        }

        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (!activeTour) throw new Error("Active tour not found");

        // 2. Create UserPlayedTour record (ABANDONED)
        await prisma.userPlayedTour.create({
            data: {
                userId: userId,
                tourId: activeTour.tourId,
                status: SessionStatus.ABANDONED,
                score: team.score,
                startedAt: activeTour.createdAt,
                finishedAt: new Date(),
                teamName: team.name,
            }
        });

        // 3. Delete the team
        await activeTourRepository.deleteTeam(team.id);

        // 4. Check if any teams remain
        const updatedActiveTour = await activeTourRepository.findActiveTourById(activeTourId);

        if (!updatedActiveTour || updatedActiveTour.teams.length === 0) {
            await activeTourRepository.deleteActiveTourById(activeTourId);
            return { id: activeTourId, status: 'DELETED' };
        }

        return updatedActiveTour;
    },

    async updatePubGolfScore(activeTourId: number, stopId: number, sips: number, userId: number) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found");

        // 1. Get previous state
        const existingStop = await activeTourRepository.findPubGolfStop(team.id, stopId);
        const oldSips = existingStop?.sips;

        // 2. Update
        const updatedStop = await activeTourRepository.updatePubGolfScore(team.id, stopId, sips);

        // 3. Calculate and Award XP Delta
        const par = updatedStop.stop.pubgolfPar;
        if (par !== null) {
            // Treat 0 sips as "unplayed" (no XP)
            const oldXP = (oldSips && oldSips > 0) ? (getScoreDetails(par, oldSips)?.recommendedXP || 0) : 0;
            const newXP = (sips && sips > 0) ? (getScoreDetails(par, sips)?.recommendedXP || 0) : 0;

            const xpDiff = newXP - oldXP;

            if (xpDiff !== 0) {
                await userRepository.addXp(userId, xpDiff);
            }
        }

        // Return updated progress
        return await activeTourService.getActiveTourProgress(activeTourId, userId);
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
    }
};
