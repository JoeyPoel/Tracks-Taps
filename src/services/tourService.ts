import { SessionStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const tourService = {
    async getAllTours() {
        return await prisma.tour.findMany({
            include: {
                author: {
                    select: { name: true },
                },
                _count: {
                    select: { stops: true },
                },
            },
        });
    },

    async getTourById(id: number) {
        return await prisma.tour.findUnique({
            where: { id },
            include: {
                author: true,
                stops: {
                    include: {
                        challenges: true,
                    },
                },
                challenges: true, // Global challenges
                reviews: {
                    include: {
                        author: true,
                    },
                },
            },
        });
    },

    async getActiveToursForUser(userId: number) {
        return await prisma.activeTour.findMany({
            where: {
                participants: {
                    some: {
                        id: userId,
                    },
                },
                status: {
                    in: [SessionStatus.IN_PROGRESS, SessionStatus.WAITING],
                },
            },
            include: {
                tour: true,
            },
        });
    },

    async startTour(tourId: number, userId: number) {
        return await prisma.activeTour.create({
            data: {
                tourId,
                status: SessionStatus.IN_PROGRESS,
                participants: {
                    connect: { id: userId },
                },
            },
        });
    },

    async getActiveTourById(id: number) {
        return await prisma.activeTour.findUnique({
            where: { id },
            include: {
                tour: {
                    include: {
                        stops: {
                            orderBy: { order: 'asc' },
                            include: {
                                challenges: true
                            }
                        },
                        challenges: true,
                    }
                },
                activeChallenges: {
                    include: {
                        challenge: true
                    }
                },
            }
        });
    },

    async completeChallenge(activeTourId: number, challengeId: number) {
        return await prisma.activeChallenge.upsert({
            where: {
                activeTourId_challengeId: {
                    activeTourId,
                    challengeId,
                },
            },
            update: {
                completed: true,
                completedAt: new Date(),
            },
            create: {
                activeTourId,
                challengeId,
                completed: true,
                completedAt: new Date(),
            },
        });
    },

    async failChallenge(activeTourId: number, challengeId: number) {
        return await prisma.activeChallenge.upsert({
            where: {
                activeTourId_challengeId: {
                    activeTourId,
                    challengeId,
                },
            },
            update: {
                failed: true,
            },
            create: {
                activeTourId,
                challengeId,
                failed: true,
            },
        });
    },

    async deleteActiveTour(activeTourId: number) {
        // First delete all active challenges associated with this tour
        await prisma.activeChallenge.deleteMany({
            where: {
                activeTourId: activeTourId
            }
        });

        // Then delete the active tour itself
        return await prisma.activeTour.delete({
            where: {
                id: activeTourId
            }
        });
    },

    async finishTour(activeTourId: number) {
        return await prisma.activeTour.update({
            where: { id: activeTourId },
            data: {
                status: SessionStatus.COMPLETED,
            },
        });
    },

    async abandonTour(activeTourId: number) {
        return await prisma.activeTour.update({
            where: { id: activeTourId },
            data: {
                status: SessionStatus.ABANDONED,
            },
        });
    },
};
