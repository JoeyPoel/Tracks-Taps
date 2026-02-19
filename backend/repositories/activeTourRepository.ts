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
            select: {
                id: true,
                status: true,
                createdAt: true,
                tour: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        _count: {
                            select: { stops: true }
                        }
                    }
                },
                teams: {
                    where: { userId: userId },
                    select: {
                        id: true,
                        currentStop: true,
                        finishedAt: true,
                        score: true
                    }
                }
            }
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
            where: {
                id: activeTourId,
                status: {
                    in: [SessionStatus.WAITING, SessionStatus.IN_PROGRESS]
                }
            },
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
            select: {
                id: true,
                status: true,
                userId: true, // Needed for host verification
                createdAt: true, // Needed for history
                tourId: true,
                tour: {
                    select: {
                        id: true,
                        title: true,
                        modes: true, // Needed for determining tabs (e.g. BINGO)
                        challenges: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                points: true,
                                bingoRow: true,
                                bingoCol: true,
                                stopId: true,
                                tourId: true,
                                options: true,
                                answer: true,
                                hint: true,
                                content: true
                            }
                        },
                        stops: {
                            orderBy: { number: 'asc' },
                            select: {
                                id: true,
                                number: true,
                                name: true,
                                description: true,
                                detailedDescription: true, // Needed for info
                                latitude: true,
                                longitude: true,
                                imageUrl: true,
                                type: true,
                                pubgolfPar: true,
                                pubgolfDrink: true,
                                challenges: {
                                    select: {
                                        id: true,
                                        title: true,
                                        type: true,
                                        points: true,
                                        bingoRow: true,
                                        bingoCol: true,
                                        stopId: true,
                                        tourId: true,
                                        options: true,
                                        answer: true,
                                        hint: true,
                                        content: true
                                    }
                                }
                            }
                        }
                    }
                },
                teams: {
                    where: userId ? { userId } : undefined,
                    include: {
                        activeChallenges: true,
                        pubGolfStops: true,
                        bingoCard: {
                            select: {
                                id: true,
                                awardedLines: true,
                                fullHouseAwarded: true
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true
                            }
                        }
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
            select: {
                id: true,
                status: true,
                winnerTeamId: true,
                teams: {
                    where: userId ? { userId } : undefined,
                    select: {
                        id: true,
                        score: true,
                        currentStop: true,
                        streak: true,
                        finishedAt: true,
                        activeChallenges: {
                            select: {
                                challengeId: true,
                                completed: true,
                                failed: true
                            }
                        },
                        pubGolfStops: {
                            select: {
                                stopId: true,
                                sips: true
                            }
                        },
                        bingoCard: {
                            select: {
                                id: true,
                                awardedLines: true,
                                fullHouseAwarded: true
                            }
                        }
                    }
                }
            }
        });
    },

    async findActiveTourLobby(id: number) {
        return await prisma.activeTour.findUnique({
            where: { id },
            include: {
                teams: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatarUrl: true,
                            }
                        }
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
        // 1. Fetch ALL Bingo Challenges for this Tour (Top-level OR Stop-level)
        const bingoChallenges = await prisma.challenge.findMany({
            where: {
                OR: [
                    { tourId: tourId },
                    { stop: { tourId: tourId } }
                ],
                bingoRow: { not: null },
                bingoCol: { not: null }
            }
        });

        if (bingoChallenges.length === 0) return null;

        // 2. Create Bingo Card
        const bingoCard = await prisma.bingoCard.create({
            data: {
                teamId: teamId
            }
        });

        // No need to create cells locally, we rely on Challenges' bingoRow/bingoCol metadata

        return bingoCard;
    },

    async getBingoCard(teamId: number) {
        return await prisma.bingoCard.findUnique({
            where: { teamId }
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

