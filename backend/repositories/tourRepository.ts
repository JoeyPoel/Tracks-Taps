import { prisma } from '../../src/lib/prisma';
import { paginate } from '../utils/pagination';

import { Prisma } from '@prisma/client';
import { TourFilters } from '../../src/types/filters';

// Helper to strip diacritics/accents and normalize strings for fuzzy matching
function normalizeString(str: string): string {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
}

// Levenshtein distance calculation for typo tolerance
function getLevenshteinDistance(a: string, b: string): number {
    const tmp = [];
    const alen = a.length;
    const blen = b.length;
    if (alen === 0) return blen;
    if (blen === 0) return alen;
    for (let i = 0; i <= alen; i++) tmp[i] = [i];
    for (let j = 0; j <= blen; j++) tmp[0][j] = j;
    for (let i = 1; i <= alen; i++) {
        for (let j = 1; j <= blen; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[alen][blen];
}

// Check if search terms match a target text fuzzy-style
function isFuzzyMatch(text: string, term: string): boolean {
    const normText = normalizeString(text);
    const normTerm = normalizeString(term);
    
    if (!normText || !normTerm) return false;
    
    // Exact or direct substring match
    if (normText.includes(normTerm)) return true;
    
    // For short search terms, avoid false matches by skipping Levenshtein check
    if (normTerm.length < 3) return false;
    
    // Typo tolerance: split target into words and compare Levenshtein distance
    const words = normText.split(/\s+/);
    for (const word of words) {
        if (word.length >= 3) {
            const distance = getLevenshteinDistance(word, normTerm);
            // Allow 1 typo for 3-5 chars, 2 typos for 6+ chars
            const maxAllowed = normTerm.length <= 5 ? 1 : 2;
            if (distance <= maxAllowed) return true;
        }
    }
    return false;
}


export const tourRepository = {
    async getAllTours(filters: TourFilters = {}) {
        const where: Prisma.TourWhereInput = {};

        // Fetch global settings to determine if we show unmoderated (pending review) tours
        const settings = await prisma.appSettings.findUnique({
            where: { id: 'global' }
        });
        const showUnmoderated = settings?.showUnmoderatedTours ?? false;
        const allowedStatuses = showUnmoderated
            ? ['PUBLISHED', 'PENDING_REVIEW']
            : ['PUBLISHED'];

        if (filters.status) {
            if (filters.status === 'PUBLISHED') {
                where.status = { in: allowedStatuses as any };
            } else {
                where.status = filters.status as any;
            }
        } else {
            where.status = { in: allowedStatuses as any };
        }

        const isFuzzySearchActive = !!(filters.searchQuery || filters.location);

        if (filters.searchQuery && !isFuzzySearchActive) {
            const terms = filters.searchQuery.trim().split(/\s+/);
            if (terms.length > 0) {
                where.AND = terms.map(term => ({
                    OR: [
                        { title: { contains: term, mode: 'insensitive' } },
                        { description: { contains: term, mode: 'insensitive' } },
                        { location: { contains: term, mode: 'insensitive' } },
                        { author: { name: { contains: term, mode: 'insensitive' } } },
                        { stopNames: { hasSome: [term] } },
                        { stops: { some: { name: { contains: term, mode: 'insensitive' } } } }
                    ]
                }));
            }
        }

        if (filters.location && !isFuzzySearchActive) {
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

        const takeLimit: number = isFuzzySearchActive ? 1000 : (limit + 1);

        // Query Prisma. Skip/take is handled in JS when doing fuzzy filtering, otherwise handled in SQL.
        const tours = await prisma.tour.findMany({
            where,
            orderBy,
            ...(isFuzzySearchActive ? { take: takeLimit } : { skip, take: takeLimit }),
            select: {
                id: true,
                title: true,
                description: true,
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
                stopNames: true,
                createdAt: true,
                author: { select: { name: true, avatarUrl: true, isAdmin: true } },
                _count: { select: { stops: true } },
                reviews: {
                    select: {
                        rating: true
                    }
                }
            }
        });

        // Perform in-memory fuzzy matching if active
        let filteredTours = tours;
        if (isFuzzySearchActive) {
            filteredTours = tours.filter(tour => {
                // 1. Filter by location if specified
                if (filters.location) {
                    if (!isFuzzyMatch(tour.location, filters.location)) {
                        return false;
                    }
                }
                // 2. Filter by general searchQuery terms if specified
                if (filters.searchQuery) {
                    const terms = filters.searchQuery.trim().split(/\s+/);
                    const matchesAllTerms = terms.every(term => {
                        if (isFuzzyMatch(tour.title, term)) return true;
                        if (isFuzzyMatch(tour.description, term)) return true;
                        if (isFuzzyMatch(tour.location, term)) return true;
                        if (tour.author?.name && isFuzzyMatch(tour.author.name, term)) return true;
                        if (tour.stopNames && tour.stopNames.some((name: string) => isFuzzyMatch(name, term))) return true;
                        return false;
                    });
                    if (!matchesAllTerms) return false;
                }
                return true;
            });
        }

        // Apply custom pagination slice when fuzzy searching
        const totalMatches = filteredTours.length;
        const slicedTours = isFuzzySearchActive
            ? filteredTours.slice(skip, skip + limit + 1)
            : filteredTours;

        const hasMore = slicedTours.length > limit;
        const pageData = hasMore ? slicedTours.slice(0, limit) : slicedTours;

        const data = pageData.map(tour => {
            const reviewsList = tour.reviews || [];
            const count = reviewsList.length;
            const avg = count > 0 ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / count : 0;
            return {
                id: tour.id,
                title: tour.title,
                location: tour.location,
                imageUrl: tour.imageUrl,
                distance: tour.distance,
                duration: tour.duration,
                points: tour.points,
                modes: tour.modes,
                difficulty: tour.difficulty,
                status: tour.status,
                type: tour.type,
                genre: tour.genre,
                createdAt: tour.createdAt,
                author: tour.author,
                _count: tour._count,
                averageRating: avg,
                reviewCount: count,
                reviews: count > 0 ? [{ rating: avg }] : []
            };
        });

        const meta = {
            total: isFuzzySearchActive ? totalMatches : (hasMore ? skip + limit + 1 : skip + tours.length),
            lastPage: Math.ceil((isFuzzySearchActive ? totalMatches : (hasMore ? skip + limit + 1 : skip + tours.length)) / limit) || 1,
            currentPage: page,
            perPage: limit,
            prev: page > 1 ? page - 1 : null,
            next: hasMore ? page + 1 : null,
        };

        return { data, meta };
    },

    async getTourById(id: number, reviewsSortBy?: string, lightweight?: boolean) {
        if (lightweight) {
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
                    stopNames: true,
                    createdAt: true,
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    },
                    stops: {
                        orderBy: { number: 'asc' },
                        select: {
                            id: true,
                            number: true,
                            name: true,
                            description: true,
                            latitude: true,
                            longitude: true,
                            type: true,
                            requiresTicket: true,
                            isFreeEntry: true,
                            ticketInfo: true,
                            openingHours: true,
                            ticketPrice: true,
                            requiresReservation: true
                        }
                    },
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                }
            });

            if (!tour) return null;

            const ratingAgg = await prisma.review.aggregate({
                where: { tourId: id },
                _avg: { rating: true }
            });

            return {
                ...tour,
                stops: tour.stops || [],
                challenges: [],
                reviews: [],
                averageRating: ratingAgg._avg.rating || 0,
                reviewCount: tour._count.reviews
            };
        }

        // 1. Fetch Tour Data
        let reviewOrder: any = { createdAt: 'desc' };
        if (reviewsSortBy === 'highest_rating') reviewOrder = { rating: 'desc' };
        else if (reviewsSortBy === 'lowest_rating') reviewOrder = { rating: 'asc' };
        else if (reviewsSortBy === 'oldest') reviewOrder = { createdAt: 'asc' };

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
                stopNames: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        level: true,
                        isAdmin: true
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
                        requiresTicket: true,
                        isFreeEntry: true,
                        ticketInfo: true,
                        openingHours: true,
                        ticketPrice: true,
                        requiresReservation: true,
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
                    orderBy: reviewOrder,
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
                                avatarUrl: true,
                                isAdmin: true
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
                        avatarUrl: true,
                        isAdmin: true
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
    async deleteTour(id: number) {
        return await prisma.$transaction(async (tx) => {
            await tx.gameInvite.deleteMany({
                where: { tourId: id }
            });
            await tx.userPlayedTour.deleteMany({
                where: { tourId: id }
            });
            return await tx.tour.delete({
                where: { id }
            });
        });
    }
};
