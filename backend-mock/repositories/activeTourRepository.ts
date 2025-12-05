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
        // 1. Fetch the tour to get its stops
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            include: { stops: true }
        });

        if (!tour) {
            throw new Error('Tour not found');
        }

        // 2. Create the ActiveTour
        const activeTour = await prisma.activeTour.create({
            data: {
                tourId,
                status: SessionStatus.IN_PROGRESS,
                participants: {
                    connect: { id: userId },
                },
            },
        });

        // 3. Create PubGolfStops for stops that have pubgolf data
        const pubGolfStopsData = tour.stops
            .filter(stop => stop.pubgolfPar !== null && stop.pubgolfDrink !== null)
            .map(stop => ({
                activeTourId: activeTour.id,
                stopId: stop.id,
                par: stop.pubgolfPar!,
                drink: stop.pubgolfDrink!,
                sips: 0 // Default sips
            }));

        if (pubGolfStopsData.length > 0) {
            await prisma.pubGolfStop.createMany({
                data: pubGolfStopsData
            });
        }

        return activeTour;
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
                                challenges: true,
                                pubGolfStops: {
                                    where: { activeTourId: id } // Only include PubGolfStop for this active tour
                                }
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
                pubGolfStops: true // Include all pub golf stops for this active tour
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
    async updatePubGolfScore(activeTourId: number, stopId: number, sips: number) {
        // Find the specific PubGolfStop entry
        const pubGolfStop = await prisma.pubGolfStop.findFirst({
            where: {
                activeTourId,
                stopId
            }
        });

        if (!pubGolfStop) {
            throw new Error('PubGolf stop not found for this active tour');
        }

        return await prisma.pubGolfStop.update({
            where: { id: pubGolfStop.id },
            data: { sips }
        });
    },

    async updateCurrentStop(activeTourId: number, currentStop: number) {
        return await prisma.activeTour.update({
            where: { id: activeTourId },
            data: { currentStop }
        });
    },

    async updateStreak(activeTourId: number, streak: number) {
        return await prisma.activeTour.update({
            where: { id: activeTourId },
            data: { streak }
        });
    },
};
