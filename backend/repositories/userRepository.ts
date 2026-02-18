import { SessionStatus } from '@prisma/client';
import { randomInt } from 'crypto';
import { prisma } from '../../src/lib/prisma';
import { paginate } from '../utils/pagination';

export const userRepository = {
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
    async createUser(data: { email: string; name: string }) {
        if (data.name.length > 25) {
            throw new Error('Name cannot exceed 25 characters');
        }
        // Generate secure 9-digit numeric code
        const referralCode = randomInt(100000000, 1000000000).toString();
        return await prisma.user.create({
            data: {
                email: data.email,
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

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string; referralCode?: string }) {
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
    }
};
