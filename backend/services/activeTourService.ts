import { SessionStatus } from '@prisma/client';
import { activeTourRepository } from '../repositories/activeTourRepository';
import { challengeRepository } from '../repositories/challengeRepository';
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

        // Deduct 1 token for playing a tour
        await userRepository.deductTokens(userId, 1);

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

        // Mark this team as finished
        await activeTourRepository.updateTeamFinish(team.id, new Date(), team.score);

        // Fetch full tour to check other teams
        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (!activeTour) throw new Error("Tour not found");

        const allTeamsFinished = activeTour.teams.every(t => t.finishedAt !== null);

        if (allTeamsFinished) {
            // Determine winner
            // Sort by score DESC, then finishedAt ASC
            const sortedTeams = [...activeTour.teams].sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score; // Higher score first
                }
                const timeA = new Date(a.finishedAt!).getTime();
                const timeB = new Date(b.finishedAt!).getTime();
                return timeA - timeB; // Earlier time first
            });

            const winner = sortedTeams[0];

            return await activeTourRepository.updateActiveTourStatus(activeTourId, SessionStatus.COMPLETED, winner.id);
        } else {
            // Tour continues for others
            // Maybe return something indicating waiting for others?
            return activeTour;
        }
    },

    async abandonTour(activeTourId: number, userId: number) {
        // 1. Find the team
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) {
            throw new Error('Team not found for this tour');
        }

        // 2. Delete the team
        await activeTourRepository.deleteTeam(team.id);

        // 3. Check if any teams remain
        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);

        // If activeTour is null (shouldn't be unless concurrently deleted), or no teams left
        if (!activeTour || activeTour.teams.length === 0) {
            await activeTourRepository.deleteActiveTourById(activeTourId);
            // Return null or undefined to indicate deletion?? 
            // Or return a "custom" status object. 
            // The controller expects a response. 
            // Let's return { status: 'DELETED' } or similar if strictly needed, 
            // but previously it returned the updated tour.
            return { id: activeTourId, status: 'DELETED' };
        }

        return activeTour;
    },

    async updatePubGolfScore(activeTourId: number, stopId: number, sips: number, userId: number) {
        const team = await activeTourRepository.findTeamByUserIdAndTourId(userId, activeTourId);
        if (!team) throw new Error("Team not found");

        await activeTourRepository.updatePubGolfScore(team.id, stopId, sips);

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
};
