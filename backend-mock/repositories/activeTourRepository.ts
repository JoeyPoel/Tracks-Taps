import { Prisma, SessionStatus } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';

// Helper to generate 9-digit ID
const generateActiveTourId = () => {
    return Math.floor(100000000 + Math.random() * 900000000);
};

export const activeTourRepository = {
    async findActiveToursByUserId(userId: number) {
        return await prisma.activeTour.findMany({
            where: {
                teams: {
                    some: {
                        userId: userId,
                    },
                },
                status: {
                    in: [SessionStatus.IN_PROGRESS, SessionStatus.WAITING],
                },
            },
            include: {
                tour: true,
                teams: {
                    where: { userId: userId }
                }
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

        const activeTourId = generateActiveTourId();

        // 2. Create the ActiveTour and the initial Team
        const activeTour = await prisma.activeTour.create({
            data: {
                id: activeTourId,
                tourId,
                status: SessionStatus.IN_PROGRESS,
                teams: {
                    create: {
                        userId,
                        name: 'My Team', // Default name, can be changed later
                        color: '#3b82f6', // Default blue
                        emoji: '🚩',
                        currentStop: 1,
                        streak: 0,
                    }
                }
            },
            include: {
                teams: true
            }
        });

        const team = activeTour.teams[0];

        // 3. Create PubGolfStops for stops that have pubgolf data (linked to Team)
        const pubGolfStopsData = tour.stops
            .filter(stop => stop.pubgolfPar !== null && stop.pubgolfDrink !== null)
            .map(stop => ({
                teamId: team.id,
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

    async joinActiveTour(activeTourId: number, userId: number, teamName?: string, teamColor?: string, teamEmoji?: string) {
        // Fetch tour to get stops for PubGolf
        const activeTour = await prisma.activeTour.findUnique({
            where: { id: activeTourId },
            include: { tour: { include: { stops: true } } }
        });

        if (!activeTour) throw new Error("Active tour not found");

        // Create Team
        const team = await prisma.team.create({
            data: {
                activeTourId: activeTour.id,
                userId,
                name: teamName || 'New Team',
                color: teamColor || '#10b981',
                emoji: teamEmoji || '🏃',
                currentStop: 1,
                streak: 0,
            }
        });

        // Create PubGolfStops
        const pubGolfStopsData = activeTour.tour.stops
            .filter(stop => stop.pubgolfPar !== null && stop.pubgolfDrink !== null)
            .map(stop => ({
                teamId: team.id,
                stopId: stop.id,
                par: stop.pubgolfPar!,
                drink: stop.pubgolfDrink!,
                sips: 0
            }));

        if (pubGolfStopsData.length > 0) {
            await prisma.pubGolfStop.createMany({
                data: pubGolfStopsData
            });
        }

        return team;
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
                                // We can't include filtered nested relations easily for all teams here without complex query
                                // But usually we want the active tour for a specific user perspective.
                                pubGolfStops: true
                            }
                        },
                        challenges: true,
                    }
                },
                teams: {
                    include: {
                        activeChallenges: {
                            include: {
                                challenge: true
                            }
                        },
                        pubGolfStops: true
                    }
                }
            }
        });
    },

    // Helper to find specific team
    async findTeamByUserIdAndTourId(userId: number, activeTourId: number) {
        return await prisma.team.findFirst({
            where: {
                userId,
                activeTourId
            },
            include: {
                activeTour: true
            }
        });
    },

    async upsertActiveChallenge(teamId: number, challengeId: number, data: Prisma.ActiveChallengeUpdateInput) {
        return await prisma.activeChallenge.upsert({
            where: {
                teamId_challengeId: {
                    teamId,
                    challengeId,
                },
            },
            update: data,
            create: {
                ...(data as Prisma.ActiveChallengeUncheckedCreateInput),
                teamId,
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

    async updateActiveTourStatus(activeTourId: number, status: SessionStatus, winnerTeamId?: number) {
        return await prisma.activeTour.update({
            where: { id: activeTourId },
            data: {
                status,
                winnerTeamId
            },
        });
    },

    async updateTeamFinish(teamId: number, finishedAt: Date, score: number) {
        return await prisma.team.update({
            where: { id: teamId },
            data: {
                finishedAt,
                score
            }
        });
    },

    async updatePubGolfScore(teamId: number, stopId: number, sips: number) {
        // Find the specific PubGolfStop entry
        const pubGolfStop = await prisma.pubGolfStop.findFirst({
            where: {
                teamId,
                stopId
            }
        });

        if (!pubGolfStop) {
            throw new Error('PubGolf stop not found for this team');
        }

        return await prisma.pubGolfStop.update({
            where: { id: pubGolfStop.id },
            data: { sips }
        });
    },

    async updateCurrentStop(teamId: number, currentStop: number) {
        return await prisma.team.update({
            where: { id: teamId },
            data: { currentStop }
        });
    },

    async updateStreak(teamId: number, streak: number) {
        return await prisma.team.update({
            where: { id: teamId },
            data: { streak }
        });
    },

    // Add point/score update to team if needed, though usually part of challenges
    async updateTeamScore(teamId: number, score: number) {
        return await prisma.team.update({
            where: { id: teamId },
            data: { score }
        });
    }
};
