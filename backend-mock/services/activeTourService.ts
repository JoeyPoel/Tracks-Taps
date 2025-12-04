import { SessionStatus } from '@prisma/client';
import { activeTourRepository } from '../repositories/activeTourRepository';
import { challengeRepository } from '../repositories/challengeRepository';
import { userRepository } from '../repositories/userRepository';

export const activeTourService = {
    async getActiveToursForUser(userId: number) {
        return await activeTourRepository.findActiveToursByUserId(userId);
    },

    async startTourWithConflictCheck(tourId: number, userId: number, force: boolean) {
        const activeTours = await activeTourRepository.findActiveToursByUserId(userId);

        if (activeTours.length > 0) {
            if (!force) {
                const error = new Error('User already has an active tour');
                (error as any).conflict = activeTours[0];
                throw error;
            }

            // If force is true, delete existing active tours
            for (const tour of activeTours) {
                // Delete challenges first
                await activeTourRepository.deleteActiveChallengesByTourId(tour.id);
                // Then delete the tour
                await activeTourRepository.deleteActiveTourById(tour.id);
            }
        }

        return await activeTourRepository.createActiveTour(tourId, userId);
    },

    // Keeping original startTour for backward compatibility if needed, but startTourWithConflictCheck is preferred
    async startTour(tourId: number, userId: number) {
        return await activeTourRepository.createActiveTour(tourId, userId);
    },

    async getActiveTourById(id: number) {
        return await activeTourRepository.findActiveTourById(id);
    },

    async completeChallenge(activeTourId: number, challengeId: number, userId: number) {
        const challenge = await challengeRepository.findChallengeById(challengeId);

        if (!challenge) {
            throw new Error("Challenge not found");
        }

        await userRepository.addXp(userId, challenge.points);

        return await activeTourRepository.upsertActiveChallenge(activeTourId, challengeId, {
            completed: true,
            completedAt: new Date(),
        });
    },

    async failChallenge(activeTourId: number, challengeId: number) {
        return await activeTourRepository.upsertActiveChallenge(activeTourId, challengeId, {
            failed: true,
        });
    },

    async deleteActiveTour(activeTourId: number) {
        await activeTourRepository.deleteActiveChallengesByTourId(activeTourId);
        return await activeTourRepository.deleteActiveTourById(activeTourId);
    },

    async finishTour(activeTourId: number) {
        return await activeTourRepository.updateActiveTourStatus(activeTourId, SessionStatus.COMPLETED);
    },

    async abandonTour(activeTourId: number) {
        return await activeTourRepository.updateActiveTourStatus(activeTourId, SessionStatus.ABANDONED);
    },

    async updatePubGolfScore(activeTourId: number, stopId: number, sips: number) {
        return await activeTourRepository.updatePubGolfScore(activeTourId, stopId, sips);
    },
};
