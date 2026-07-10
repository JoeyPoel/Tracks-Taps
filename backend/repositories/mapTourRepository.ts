import { prisma } from '../../src/lib/prisma';
import { TourStatus } from '@prisma/client';

export const mapTourRepository = {
    async getTours(bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
        const selectQuery = {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            startLat: true,
            startLng: true,
            distance: true,
            duration: true,
            points: true,
            genre: true,
            difficulty: true,
            modes: true,
            author: { select: { name: true } },
            stops: {
                take: 1,
                orderBy: { number: 'asc' } as const,
                select: {
                    latitude: true,
                    longitude: true,
                    number: true,
                }
            },
            // reviews: { select: { rating: true } }, // Removed for performance
            _count: { select: { stops: true } }
        };

        const settings = await prisma.appSettings.findUnique({
            where: { id: 'global' }
        });
        const showUnmoderated = settings?.showUnmoderatedTours ?? false;
        const statusFilter = showUnmoderated
            ? { in: ['PUBLISHED', 'PENDING_REVIEW'] as TourStatus[] }
            : 'PUBLISHED' as TourStatus;

        if (!bounds) {
            return await prisma.tour.findMany({
                where: {
                    status: statusFilter
                },
                select: selectQuery
            });
        }

        return await prisma.tour.findMany({
            where: {
                status: statusFilter,
                startLat: { gte: bounds.minLat, lte: bounds.maxLat },
                startLng: { gte: bounds.minLng, lte: bounds.maxLng },
            },
            select: selectQuery
        });
    },
};
