import { prisma } from '../../src/lib/prisma';

import { Prisma } from '@prisma/client';
import { TourFilters } from '../../src/types/filters';

export const tourRepository = {
    async getAllTours(filters: TourFilters = {}) {
        const where: Prisma.TourWhereInput = {};

        if (filters.searchQuery) {
            const terms = filters.searchQuery.trim().split(/\s+/);
            if (terms.length > 0) {
                where.AND = terms.map(term => ({
                    OR: [
                        { title: { contains: term, mode: 'insensitive' } },
                        { description: { contains: term, mode: 'insensitive' } },
                        { location: { contains: term, mode: 'insensitive' } }
                    ]
                }));
            }
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

        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
        const skip = (page - 1) * limit;

        return await prisma.tour.findMany({
            where,
            orderBy,
            skip,
            take: limit,
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

    async createTour(data: Prisma.TourCreateInput) {
        return await prisma.tour.create({
            data,
            include: {
                stops: {
                    include: {
                        challenges: true,
                    },
                },
                challenges: true,
            },
        });
    },
};
