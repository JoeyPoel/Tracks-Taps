import { Prisma, SessionStatus } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';

export const activeTourRepository = {
    async findActiveToursByUserId(userId: number) {
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

    async createActiveTour(tourId: number, userId: number) {
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

    async findActiveTourById(id: number) {
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

    async upsertActiveChallenge(activeTourId: number, challengeId: number, data: Prisma.ActiveChallengeUpdateInput) {
        return await prisma.activeChallenge.upsert({
            where: {
                activeTourId_challengeId: {
                    activeTourId,
                    challengeId,
                },
            },
            update: data,
            create: {
                ...(data as Prisma.ActiveChallengeUncheckedCreateInput),
                activeTourId,
                challengeId,
            },
        });
    },

    async deleteActiveChallengesByTourId(activeTourId: number) {
        return await prisma.activeChallenge.deleteMany({
            where: {
                activeTourId: activeTourId
            }
        });
    },

    async deleteActiveTourById(activeTourId: number) {
        return await prisma.activeTour.delete({
            where: {
                id: activeTourId
            }
        });
    },

    async updateActiveTourStatus(activeTourId: number, status: SessionStatus) {
        return await prisma.activeTour.update({
            where: { id: activeTourId },
            data: {
                status,
            },
        });
    },
};
