import { ChallengeType, Difficulty, Prisma, StopType } from '@prisma/client';
import { tourService } from '../services/tourService';

// Helper to map string to StopType safe enum
const mapStopType = (type: string): StopType => {
    switch (type) {
        case 'Food_Dining': return StopType.Food_Dining;
        case 'Coffee_Drink': return StopType.Coffee_Drink;
        case 'Nightlife': return StopType.Nightlife;
        case 'Museum_Art': return StopType.Museum_Art;
        case 'Monument_Landmark': return StopType.Monument_Landmark;
        case 'Religious': return StopType.Religious;
        case 'Nature_Park': return StopType.Nature_Park;
        case 'Shopping': return StopType.Shopping;
        case 'Transit_Stop': return StopType.Transit_Stop;
        case 'Viewpoint': return StopType.Viewpoint;
        case 'Info_Point': return StopType.Info_Point;
        case 'Facilities': return StopType.Facilities;
        // Mappings for robust input
        case 'Hidden_Gem': return StopType.Viewpoint;
        default: return StopType.Viewpoint;
    }
};

const mapDifficulty = (diff: string): Difficulty => {
    switch (diff) {
        case 'EASY': return Difficulty.EASY;
        case 'HARD': return Difficulty.HARD;
        default: return Difficulty.MEDIUM;
    }
};

const mapChallengeType = (type: string): ChallengeType => {
    if (Object.values(ChallengeType).includes(type as ChallengeType)) {
        return type as ChallengeType;
    }
    // Fallback or default
    return ChallengeType.TRIVIA;
};

export const tourController = {
    async getAllTours(request: Request) {
        try {
            const url = new URL(request.url);
            const searchParams = url.searchParams;

            const filters: any = {
                searchQuery: searchParams.get('searchQuery') || undefined,
                location: searchParams.get('location') || undefined,
                minDistance: searchParams.get('minDistance') ? Number(searchParams.get('minDistance')) : undefined,
                maxDistance: searchParams.get('maxDistance') ? Number(searchParams.get('maxDistance')) : undefined,
                minDuration: searchParams.get('minDuration') ? Number(searchParams.get('minDuration')) : undefined,
                maxDuration: searchParams.get('maxDuration') ? Number(searchParams.get('maxDuration')) : undefined,
                difficulty: searchParams.get('difficulty') || undefined,
                sortBy: searchParams.get('sortBy') || undefined,
                sortOrder: searchParams.get('sortOrder') || undefined,
                page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
                limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
            };

            const modes = searchParams.getAll('modes[]');
            if (modes.length > 0) filters.modes = modes;

            // Handle genres (support both genres[] and comma-separated genres)
            let genres = searchParams.getAll('genres[]');
            if (genres.length === 0) {
                const genresParam = searchParams.get('genres');
                if (genresParam) {
                    genres = genresParam.split(',');
                }
            }
            if (genres.length > 0) filters.genres = genres;

            const tours = await tourService.getAllTours(filters);
            return Response.json(tours);
        } catch (error) {
            console.error('Error fetching tours:', error);
            return Response.json({ error: 'Failed to fetch tours' }, { status: 500 });
        }
    },

    async getTourById(request: Request, params?: { id: string }) {
        let id = params?.id;

        if (!id) {
            // Fallback: try to extract from URL
            const url = new URL(request.url);
            const segments = url.pathname.split('/');
            id = segments[segments.length - 1];
        }

        if (!id) {
            return Response.json({ error: 'Missing tourId' }, { status: 400 });
        }

        const tourId = Number(id);
        if (isNaN(tourId)) {
            return Response.json({ error: 'Invalid tourId' }, { status: 400 });
        }

        try {
            const tour = await tourService.getTourById(tourId);
            if (!tour) {
                return Response.json({ error: 'Tour not found' }, { status: 404 });
            }
            return Response.json(tour);
        } catch (error: any) {
            console.error('Error fetching tour details:', error);
            return Response.json({ error: 'Failed to fetch tour details', details: error.message }, { status: 500 });
        }
    },

    async createTour(request: Request, userId: number) {
        try {
            const data = await request.json();

            // Validation
            if (!data.title || !data.location) {
                return Response.json({ error: 'Missing required fields (title, location)' }, { status: 400 });
            }

            // Length Validation
            if (data.title.length > 50) return Response.json({ error: 'Title must be 50 characters or less' }, { status: 400 });
            if (data.location.length > 50) return Response.json({ error: 'Location must be 50 characters or less' }, { status: 400 });
            if (data.description && data.description.length > 500) return Response.json({ error: 'Description must be 500 characters or less' }, { status: 400 });

            if (Array.isArray(data.stops)) {
                for (const stop of data.stops) {
                    if (stop.name && stop.name.length > 50) return Response.json({ error: `Stop name "${stop.name}" exceeds 50 characters` }, { status: 400 });
                    if (stop.description && stop.description.length > 100) return Response.json({ error: `Stop short description exceeds 100 characters` }, { status: 400 });
                    if (stop.detailedDescription && stop.detailedDescription.length > 1000) return Response.json({ error: `Stop detailed description exceeds 1000 characters` }, { status: 400 });

                    if (Array.isArray(stop.challenges)) {
                        for (const challenge of stop.challenges) {
                            if (challenge.title && challenge.title.length > 50) return Response.json({ error: `Challenge title "${challenge.title}" exceeds 50 characters` }, { status: 400 });
                            if (challenge.content && challenge.content.length > 250) return Response.json({ error: `Challenge question/content exceeds 250 characters` }, { status: 400 });
                            if (challenge.hint && challenge.hint.length > 100) return Response.json({ error: `Challenge hint exceeds 100 characters` }, { status: 400 });
                        }
                    }
                }
            }

            if (Array.isArray(data.challenges)) {
                for (const challenge of data.challenges) {
                    if (challenge.title && challenge.title.length > 50) return Response.json({ error: `Global Challenge title "${challenge.title}" exceeds 50 characters` }, { status: 400 });
                    if (challenge.content && challenge.content.length > 250) return Response.json({ error: `Global Challenge question/content exceeds 250 characters` }, { status: 400 });
                    if (challenge.hint && challenge.hint.length > 100) return Response.json({ error: `Global Challenge hint exceeds 100 characters` }, { status: 400 });
                }
            }

            // Transform data to fit Prisma Create Input
            const tourData: Prisma.TourCreateInput = {
                title: data.title,
                location: data.location,
                description: data.description || '',
                imageUrl: data.imageUrl || '',
                distance: parseFloat(data.distance) || 0,
                duration: parseInt(data.duration) || 0,
                points: parseInt(data.points) || 0,
                modes: Array.isArray(data.modes) ? data.modes : [],
                difficulty: mapDifficulty(data.difficulty),
                startLat: data.startLat ? parseFloat(data.startLat) : null,
                startLng: data.startLng ? parseFloat(data.startLng) : null,

                // Connect Author (Logged in User)
                author: {
                    connect: { id: userId }
                },

                // Create Stops and Nested Challenges
                stops: {
                    create: Array.isArray(data.stops) ? data.stops.map((stop: any) => ({
                        number: stop.number,
                        name: stop.name || '',
                        description: stop.description || '',
                        latitude: parseFloat(stop.latitude) || 0,
                        longitude: parseFloat(stop.longitude) || 0,
                        type: mapStopType(stop.type),
                        pubgolfPar: stop.pubgolfPar || null,
                        pubgolfDrink: stop.pubgolfDrink || null,
                        challenges: {
                            create: Array.isArray(stop.challenges) ? stop.challenges.map((c: any) => ({
                                title: c.title,
                                type: Object.values(ChallengeType).includes(c.type) ? c.type : ChallengeType.LOCATION, // Default or validate
                                points: c.points || 0,
                                content: c.content || '',
                                hint: c.hint || '',
                                answer: c.answer || '',
                                options: c.options || [],
                            })) : []
                        }
                    })) : []
                },

                // Create Global Challenges (Only if not linked to a stop in the input)
                // Filter out challenges that are already processed in stops (identified by having a stopId in source or logic)
                challenges: {
                    create: Array.isArray(data.challenges)
                        ? data.challenges
                            .filter((c: any) => !c.stopId && !c.tourId) // Simple heuristic: if it has no foreign keys in source, treat as global
                            .map((c: any) => ({
                                title: c.title,
                                type: Object.values(ChallengeType).includes(c.type) ? c.type : ChallengeType.LOCATION,
                                points: c.points || 0,
                                content: c.content || '',
                                hint: c.hint || '',
                                answer: c.answer || '',
                                options: c.options || [],
                            }))
                        : []
                }
            };

            const createdTour = await tourService.createTour(tourData);
            return Response.json(createdTour, { status: 201 });

        } catch (error: any) {
            console.error('Error creating tour:', error);
            // Handle validation errors from Prisma
            return Response.json({ error: 'Failed to create tour', details: error.message }, { status: 500 });
        }
    }
};
