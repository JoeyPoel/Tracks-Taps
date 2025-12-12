import { prisma } from '../../src/lib/prisma';

import { Prisma } from '@prisma/client';
import { TourFilters } from '../../src/types/filters';

export const tourRepository = {
    async getAllTours(filters: TourFilters = {}) {
        const where: Prisma.TourWhereInput = {};

        if (filters.searchQuery) {
            where.OR = [
                { title: { contains: filters.searchQuery, mode: 'insensitive' } },
                { description: { contains: filters.searchQuery, mode: 'insensitive' } },
                { location: { contains: filters.searchQuery, mode: 'insensitive' } }
            ];
        }

        if (filters.location) {
            where.location = { contains: filters.location, mode: 'insensitive' };
        }

        if (filters.minDistance !== undefined || filters.maxDistance !== undefined) {
            where.distance = {};
            if (filters.minDistance !== undefined) where.distance.gte = parseFloat(filters.minDistance.toString());
            if (filters.maxDistance !== undefined) where.distance.lte = parseFloat(filters.maxDistance.toString());
        }

        if (filters.minDuration !== undefined || filters.maxDuration !== undefined) {
            where.duration = {};
            if (filters.minDuration !== undefined) where.duration.gte = parseInt(filters.minDuration.toString());
            if (filters.maxDuration !== undefined) where.duration.lte = parseInt(filters.maxDuration.toString());
        }

        if (filters.difficulty) {
            where.difficulty = filters.difficulty;
        }

        if (filters.modes && filters.modes.length > 0) {
            where.modes = { hasSome: filters.modes };
        }

        const orderBy: Prisma.TourOrderByWithRelationInput = {};
        if (filters.sortBy) {
            const order = filters.sortOrder || 'asc';
            switch (filters.sortBy) {
                case 'name': orderBy.title = order; break;
                case 'distance': orderBy.distance = order; break;
                case 'duration': orderBy.duration = order; break;
                case 'createdAt': orderBy.createdAt = order; break;
                case 'location': orderBy.location = order; break;
                // 'popularity' could map to 'points' or review count?
                case 'popularity': orderBy.points = order === 'asc' ? 'desc' : 'asc'; break; // Pop usually desc
            }
        } else {
            // Default sort
            orderBy.createdAt = 'desc';
        }

        return await prisma.tour.findMany({
            where,
            orderBy,
            include: {
                author: {
                    select: { name: true },
                },
                _count: {
                    select: { stops: true },
                },
                reviews: true, // Needed for rating calc
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
