import { prisma } from '../../src/lib/prisma';
import { paginate } from '../utils/pagination';

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
                        { location: { contains: term, mode: 'insensitive' } },
                        { author: { name: { contains: term, mode: 'insensitive' } } }
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

        if (filters.genres && filters.genres.length > 0) {
            where.genre = { in: filters.genres };
        }

        // --- NEW: minRating filter ---
        if (filters.minRating !== undefined && filters.minRating > 0) {
            // Prisma doesn't support filtering by aggregate (having equivalent) easily in findMany
            // So we find tourIds that meet the rating criteria first
            const ratingThreshold = parseFloat(filters.minRating.toString());
            const qualifiedTours = await prisma.review.groupBy({
                by: ['tourId'],
                where: {
                    tour: where // Apply existing where filters to reviews to narrow down tourIds
                },
                _avg: {
                    rating: true
                },
                having: {
                    rating: {
                        _avg: {
                            gte: ratingThreshold
                        }
                    }
                }
            });
            
            const qualifiedIds = qualifiedTours.map(t => t.tourId);
            where.id = { in: qualifiedIds };
            
            // If no tours match the rating, ensure the result is empty
            if (qualifiedIds.length === 0) {
                return { data: [], meta: { total: 0, page: 1, lastPage: 0, limit: 20 } };
            }
        }

        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 20;
        const skip = (page - 1) * limit;

        const orderBy: Prisma.TourOrderByWithRelationInput = {};
        if (filters.sortBy) {
            const order = filters.sortOrder || 'asc';
            switch (filters.sortBy) {
                case 'name': orderBy.title = order; break;
                case 'distance': orderBy.distance = order; break;
                case 'duration': orderBy.duration = order; break;
                case 'createdAt': orderBy.createdAt = order; break;
                case 'location': orderBy.location = order; break;
                case 'popularity': orderBy.points = order === 'asc' ? 'desc' : 'asc'; break;
            }
        } else {
            orderBy.createdAt = 'desc';
        }

        const result = await paginate<any, Prisma.TourFindManyArgs>(
            prisma.tour,
            {
                where,
                orderBy,
                select: {
                    id: true,
                    title: true,
                    location: true,
                    imageUrl: true,
                    distance: true,
                    duration: true,
                    points: true,
                    modes: true,
                    difficulty: true,
                    status: true,
                    type: true,
                    genre: true,
                    createdAt: true,
                    author: { select: { name: true, avatarUrl: true } },
                    _count: { select: { stops: true } },
                },
            },
            page,
            limit
        );

        return await this.enrichTours(result.data, result.meta);
    },

    // Helper to enrich tours with ratings
    async enrichTours(tours: any[], meta: any) {
        const tourIds = tours.map(t => t.id);
        const ratings = await prisma.review.groupBy({
            by: ['tourId'],
            _avg: { rating: true },
            _count: { rating: true },
            where: { tourId: { in: tourIds } }
        });

        const data = tours.map(tour => {
            const ratingData = ratings.find(r => r.tourId === tour.id);
            return {
                ...tour,
                averageRating: ratingData?._avg.rating || 0,
                reviewCount: ratingData?._count.rating || 0,
                reviews: ratingData?._avg.rating ? [{ rating: ratingData._avg.rating }] : []
            };
        });

        return { data, meta };
    },

    async getTourById(id: number) {
        // 1. Fetch Tour Data
        const tour = await prisma.tour.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                location: true,
                description: true,
                imageUrl: true,
                distance: true,
                duration: true,
                points: true,
                modes: true,
                difficulty: true,
                status: true,
                type: true,
                genre: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        level: true
                    }
                },
                stops: {
                    orderBy: { number: 'asc' },
                    select: {
                        id: true,
                        number: true,
                        name: true,
                        description: true,
                        detailedDescription: true,
                        imageUrl: true,
                        latitude: true,
                        longitude: true,
                        type: true,
                        pubgolfPar: true,
                        pubgolfDrink: true,
                        challenges: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                points: true,
                                content: true,
                                hint: true,
                                answer: true,
                                options: true,
                                bingoRow: true,
                                bingoCol: true
                            }
                        }
                    }
                },
                challenges: {
                    where: { stopId: null },
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        points: true,
                        content: true,
                        hint: true,
                        answer: true,
                        options: true,
                        bingoRow: true,
                        bingoCol: true
                    }
                },
                reviews: {
                    take: 20, // Increased from 3 to show more reviews on detail screen
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        content: true,
                        rating: true,
                        createdAt: true,
                        photos: true,
                        authorId: true,
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        reviews: true,
                        stops: true
                    }
                }
            },
        });

        if (!tour) return null;

        // 2. Aggregate Rating (Fast separate query)
        const ratingAgg = await prisma.review.aggregate({
            where: { tourId: id },
            _avg: { rating: true }
        });

        return {
            ...tour,
            averageRating: ratingAgg._avg.rating || 0,
            reviewCount: tour._count.reviews
        };
    },

    async createTour(data: Prisma.TourCreateInput) {
        return await prisma.tour.create({
            data,
            include: {
                author: {
                    select: {
                        name: true,
                        avatarUrl: true
                    },
                },
                stops: {
                    include: {
                        challenges: true,
                    },
                },
                challenges: true,
            },
        });
    },

    async createTourByJson(data: Prisma.TourCreateInput) {
        return await prisma.tour.create({
            data,
            include: {
                stops: {
                    include: {
                        challenges: true
                    }
                },
                challenges: true
            }
        });
    },

    async updateTour(id: number, data: Prisma.TourUpdateInput) {
        return await prisma.tour.update({
            where: { id },
            data,
            include: {
                stops: {
                    include: {
                        challenges: true
                    }
                },
                challenges: true
            }
        });
    },
};
