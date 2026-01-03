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
                tour: {
                    include: {
                        _count: {
                            select: { stops: true }
                        }
                    }
                },
                teams: {
                    where: { userId: userId }
                }
            },
        });
    },

    async createActiveTour(tourId: number, userId: number, teamName?: string, teamColor?: string, teamEmoji?: string) {
        // 1. Fetch the tour to get its stops
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            include: { stops: true }
        });

        if (!tour) {
            throw new Error('Tour not found');
        }

        const activeTourId = generateActiveTourId();

        const activeTour = await prisma.activeTour.create({
            data: {
                id: activeTourId,
                tourId,
                userId, // Set the creator as the host
                status: SessionStatus.WAITING,
                teams: {
                    create: {
                        userId,
                        name: teamName,
                        color: teamColor,
                        emoji: teamEmoji,
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
                sips: 0 // Default sips
            }));

        if (pubGolfStopsData.length > 0) {
            await prisma.pubGolfStop.createMany({
                data: pubGolfStopsData
            });
        }

        // 4. Create Bingo Card if applicable
        if (tour.modes.includes('BINGO')) {
            await activeTourRepository.createBingoCard(team.id, tour.id);
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
                name: teamName,
                color: teamColor,
                emoji: teamEmoji,
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
                sips: 0
            }));

        if (pubGolfStopsData.length > 0) {
            await prisma.pubGolfStop.createMany({
                data: pubGolfStopsData
            });
        }

        // Create Bingo Card if applicable
        if (activeTour.tour.modes.includes('BINGO')) {
            await activeTourRepository.createBingoCard(team.id, activeTour.tour.id);
        }

        return team;
    },

    async findActiveTourById(id: number, userId?: number) {
        const activeTour = await prisma.activeTour.findUnique({
            where: { id },
            include: {
                tour: {
                    include: {
                        stops: {
                            orderBy: { number: 'asc' },
                            include: {
                                challenges: true,
                            }
                        },
                        challenges: true,
                    }
                },
                teams: {
                    where: userId ? { userId } : undefined,
                    include: {
                        activeChallenges: true,
                        pubGolfStops: true,
                        bingoCard: {
                            include: {
                                cells: true
                            }
                        },
                        user: true
                    }
                }
            }
        });

        if (!activeTour || !activeTour.tour) return null;

        // Shuffle logic helper
        const shuffleOptions = (challenges: any[]) => {
            return challenges.map(c => {
                if (c.type === 'TRIVIA' && Array.isArray(c.options)) {
                    // Create a copy and shuffle
                    const shuffled = [...c.options].sort(() => Math.random() - 0.5);
                    return { ...c, options: shuffled };
                }
                return c;
            });
        };

        // Apply shuffle to tour challenges
        if (activeTour.tour.challenges) {
            activeTour.tour.challenges = shuffleOptions(activeTour.tour.challenges);
        }

        // Apply shuffle to stop challenges
        if (activeTour.tour.stops) {
            activeTour.tour.stops = activeTour.tour.stops.map(stop => ({
                ...stop,
                challenges: shuffleOptions(stop.challenges)
            }));
        }

        return activeTour;
    },

    async findActiveTourProgress(activeTourId: number, userId?: number) {

        return await prisma.activeTour.findUnique({
            where: { id: activeTourId },
            include: {
                // Tour is purposefully OMITTED here for performance
                teams: {
                    where: userId ? { userId } : undefined,
                    include: {
                        activeChallenges: true,
                        pubGolfStops: true,
                        bingoCard: {
                            include: {
                                cells: true
                            }
                        }
                    }
                },
            },
        });
    },

    async findActiveTourLobby(id: number) {
        return await prisma.activeTour.findUnique({
            where: { id },
            include: {
                teams: {
                    include: {
                        user: true
                    }
                },
                tour: {
                    select: {
                        title: true,
                        imageUrl: true,
                        _count: {
                            select: { stops: true }
                        }
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

    async findPubGolfStop(teamId: number, stopId: number) {
        return await prisma.pubGolfStop.findFirst({
            where: {
                teamId,
                stopId
            },
            include: {
                stop: true
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
            data: { sips },
            include: { stop: true }
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
    },

    async updateTeamDetails(teamId: number, name: string, color: string, emoji: string) {
        return await prisma.team.update({
            where: { id: teamId },
            data: {
                name,
                color,
                emoji
            }
        });
    },

    async deleteTeam(teamId: number) {
        return await prisma.team.delete({
            where: { id: teamId }
        });
    },

    async createBingoCard(teamId: number, tourId: number) {
        // 1. Fetch Tour with Bingo Challenges
        const tour = await prisma.tour.findUnique({
            where: { id: tourId },
            include: {
                challenges: {
                    where: {
                        bingoRow: { not: null },
                        bingoCol: { not: null }
                    }
                }
            }
        });

        if (!tour) return null;

        const bingoChallenges = tour.challenges;

        if (bingoChallenges.length === 0) return null;

        // 2. Create Bingo Card
        const bingoCard = await prisma.bingoCard.create({
            data: {
                teamId: teamId
            }
        });

        // 3. Create Cells (Map by row/col)
        const cellData = bingoChallenges.map(challenge => ({
            bingoCardId: bingoCard.id,
            challengeId: challenge.id,
            row: challenge.bingoRow!,
            col: challenge.bingoCol!
        }));

        await prisma.bingoCell.createMany({
            data: cellData
        });

        return bingoCard;
    },

    async getBingoCard(teamId: number) {
        return await prisma.bingoCard.findUnique({
            where: { teamId },
            include: {
                cells: {
                    include: { challenge: true }
                }
            }
        });
    },

    async updateBingoCard(cardId: number, awardedLines: string[], fullHouseAwarded: boolean) {
        return await prisma.bingoCard.update({
            where: { id: cardId },
            data: {
                awardedLines,
                fullHouseAwarded
            }
        });
    },

    async deleteBingoCard(teamId: number) {
        return await prisma.bingoCard.deleteMany({
            where: { teamId }
        });
    }
};

