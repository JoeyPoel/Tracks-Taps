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
};
