import { SessionStatus } from '@prisma/client';
import { randomInt } from 'crypto';
import { prisma } from '../../src/lib/prisma';
import { paginate } from '../utils/pagination';

export const userRepository = {
    async getUserIdByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });
    },

    async getUserProfile(userId: number) {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                xp: true,
                level: true,
                tokens: true,
                referralCode: true,
                createdAt: true,
                _count: {
                    select: {
                        createdTours: true,
                        playedTours: true
                    }
                }
            }
        });
    },

    async getUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                authId: true,
                avatarUrl: true,
                xp: true,
                level: true,
                tokens: true,
                referralCode: true,
                createdAt: true,
                _count: {
                    select: {
                        createdTours: true,
                        playedTours: true
                    }
                }
            }
        });
    },

    async getUserByAuthId(authId: string) {
        return await prisma.user.findUnique({
            where: { authId },
            select: {
                id: true,
                name: true,
                email: true,
                authId: true,
                avatarUrl: true,
                xp: true,
                level: true,
                tokens: true,
                referralCode: true,
                createdAt: true,
                _count: {
                    select: {
                        createdTours: true,
                        playedTours: true
                    }
                }
            }
        });
    },

    async getUserByName(name: string) {
        return await prisma.user.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                xp: true,
                level: true,
                tokens: true,
                referralCode: true,
                createdAt: true,
                _count: {
                    select: {
                        createdTours: true,
                        playedTours: true
                    }
                }
            }
        });
    },

    async searchUsers(query: string, limit: number = 10, page: number = 1) {
        const skip = (page - 1) * limit;
        return await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                level: true
            },
            skip,
            take: limit
        });
    },

    async createUser(data: { email: string; name: string; authId?: string }) {
        if (data.name.length > 25) {
            throw new Error('Name cannot exceed 25 characters');
        }
        // Generate secure 9-digit numeric code
        const referralCode = randomInt(100000000, 1000000000).toString();

        return await prisma.user.create({
            data: {
                email: data.email,
                authId: data.authId,
                name: data.name,
                xp: 0,
                tokens: 0,
                level: 1,
                referralCode,
            },
        });
    },

    async claimReferral(userId: number, code: string) {
        const referrer = await prisma.user.findUnique({
            where: { referralCode: code }
        });

        if (!referrer) {
            throw new Error('Invalid referral code');
        }

        if (referrer.id === userId) {
            throw new Error('Cannot refer yourself');
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.referredBy) {
            throw new Error('Already referred');
        }

        // Circular check (Simple 1-level: A -> B -> A)
        if (referrer.referredBy === userId) {
            throw new Error('Circular referral detected');
        }

        return await prisma.$transaction(async (tx) => {
            // Link user to referrer
            await tx.user.update({
                where: { id: userId },
                data: { referredBy: referrer.id }
            });

            // Increment count on referrer
            const updatedReferrer = await tx.user.update({
                where: { id: referrer.id },
                data: { referralCount: { increment: 1 } }
            });

            // Check for reward (every 3rd referral)
            let rewardAwarded = false;
            if (updatedReferrer.referralCount % 3 === 0) {
                await tx.user.update({
                    where: { id: referrer.id },
                    data: { tokens: { increment: 1 } }
                });
                rewardAwarded = true;
            }

            return { referrer: updatedReferrer, rewardAwarded };
        });
    },

    async addXp(userId: number, amount: number) {
        return await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: amount } },
        });
    },

    async deductTokens(userId: number, amount: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokens: true }
        });

        if (!user || user.tokens < amount) {
            throw new Error('Insufficient tokens');
        }

        return await prisma.user.update({
            where: { id: userId },
            data: { tokens: { decrement: amount } },
        });
    },

    async addTokens(userId: number, amount: number) {
        return await prisma.user.update({
            where: { id: userId },
            data: { tokens: { increment: amount } },
        });
    },

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string; referralCode?: string; authId?: string }) {
        if (data.name && data.name.length > 25) {
            throw new Error('Name cannot exceed 25 characters');
        }
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    },

    async getUserPlayedTours(userId: number, page: number = 1, limit: number = 10) {
        return paginate(
            prisma.userPlayedTour,
            {
                where: {
                    userId: userId,
                    status: SessionStatus.COMPLETED
                },
                select: {
                    id: true,
                    status: true,
                    score: true,
                    finishedAt: true,
                    tour: {
                        select: {
                            id: true,
                            title: true,
                            imageUrl: true,
                            distance: true,
                            duration: true,
                            points: true,
                            modes: true,
                            genre: true,
                            type: true,
                            author: { select: { name: true } },
                            _count: { select: { stops: true, reviews: true } },
                            reviews: { select: { rating: true } }
                        }
                    }
                },
                orderBy: { finishedAt: 'desc' },
            },
            page,
            limit
        );
    },

    async getUserCreatedTours(userId: number, page: number = 1, limit: number = 10) {
        return paginate(
            prisma.tour,
            {
                where: { authorId: userId },
                select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                    distance: true,
                    duration: true,
                    status: true,
                    createdAt: true,
                    author: { select: { name: true } },
                    _count: { select: { stops: true, reviews: true } },
                    reviews: { select: { rating: true } }
                },
                orderBy: { createdAt: 'desc' },
            },
            page,
            limit
        );
    },

    async getPurchase(transactionId: string) {
        return await prisma.purchase.findUnique({
            where: { transactionId }
        });
    },

    async createPurchase(userId: number, data: {
        transactionId: string;
        productId: string;
        tokens: number;
        price?: number | null;
        currency?: string | null;
    }) {
        return await prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.create({
                data: {
                    userId,
                    transactionId: data.transactionId,
                    productId: data.productId,
                    tokens: data.tokens,
                    price: data.price,
                    currency: data.currency
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: { tokens: { increment: data.tokens } }
            });

            return purchase;
        });
    },

    async deleteUser(userId: number) {
        // 1. Get or create the "Deleted User" (system account)
        const DELETED_USER_EMAIL = 'deleted@tracksandtaps.com';

        return await prisma.$transaction(async (tx) => {
            let ghostUser = await tx.user.findUnique({
                where: { email: DELETED_USER_EMAIL }
            });

            if (!ghostUser) {
                ghostUser = await tx.user.create({
                    data: {
                        email: DELETED_USER_EMAIL,
                        name: 'Deleted User',
                        xp: 0,
                        tokens: 0,
                        level: 1,
                        referralCode: 'DELETED' + randomInt(1000, 9999)
                    }
                });
            }

            // 2. Reassign created tours to the ghost user
            await tx.tour.updateMany({
                where: { authorId: userId },
                data: { authorId: ghostUser.id }
            });

            // 3. Delete related data that shouldn't persist
            // Friendships
            await tx.friendship.deleteMany({
                where: {
                    OR: [
                        { requesterId: userId },
                        { addresseeId: userId }
                    ]
                }
            });

            // Invites
            await tx.gameInvite.deleteMany({
                where: {
                    OR: [
                        { inviterId: userId },
                        { inviteeId: userId }
                    ]
                }
            });

            // Reviews (Delete as requested, "everything else should be deleted")
            await tx.review.deleteMany({
                where: { authorId: userId }
            });

            // User Played Tours history
            await tx.userPlayedTour.deleteMany({
                where: { userId: userId }
            });

            // Achievements
            await tx.userAchievement.deleteMany({
                where: { userId: userId }
            });

            // Feedback
            await tx.feedback.deleteMany({
                where: { userId: userId }
            });

            // Active Tours (where user is host)
            await tx.activeTour.deleteMany({
                where: { userId: userId }
            });

            // Teams (where user is participant)
            const userTeams = await tx.team.findMany({
                where: { userId: userId },
                select: { id: true }
            });
            const userTeamIds = userTeams.map(t => t.id);

            if (userTeamIds.length > 0) {
                // Explicitly delete team dependencies (although DB cascade usually handles this)
                await tx.activeChallenge.deleteMany({
                    where: { teamId: { in: userTeamIds } }
                });
                await tx.pubGolfStop.deleteMany({
                    where: { teamId: { in: userTeamIds } }
                });
                await tx.bingoCard.deleteMany({
                    where: { teamId: { in: userTeamIds } }
                });
                await tx.team.deleteMany({
                    where: { id: { in: userTeamIds } }
                });
            }

            // Purchases
            await tx.purchase.deleteMany({
                where: { userId: userId }
            });

            // Tour Lists
            await tx.tourList.deleteMany({
                where: { userId: userId }
            });

            // Nullify referrals (users referred by this user)
            await tx.user.updateMany({
                where: { referredBy: userId },
                data: { referredBy: null }
            });

            // 4. Finally delete the user
            return await tx.user.delete({
                where: { id: userId }
            });
        });
    }
};
