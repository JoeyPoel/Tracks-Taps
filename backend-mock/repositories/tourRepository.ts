import { prisma } from '../../src/lib/prisma';

export const tourRepository = {
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
};
