import { prisma } from '../../src/lib/prisma';

export const mapTourRepository = {
    async getTours(bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
        if (!bounds) {
            return await prisma.tour.findMany({
                include: {
                    stops: true,
                    reviews: true,
                },
            });
        }

        return await prisma.tour.findMany({
            where: {
                startLat: {
                    gte: bounds.minLat,
                    lte: bounds.maxLat,
                },
                startLng: {
                    gte: bounds.minLng,
                    lte: bounds.maxLng,
                },
            },
            include: {
                stops: true,
                reviews: true,
            },
        });
    },
};
