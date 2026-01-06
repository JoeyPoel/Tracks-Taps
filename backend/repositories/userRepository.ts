import { randomBytes, randomInt, scryptSync } from 'crypto';
import { prisma } from '../../src/lib/prisma';

const hashPassword = (password: string) => {
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hashedPassword}`;
};

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
    async createUser(data: { email: string; name: string; password?: string }) {
        // Generate secure 9-digit numeric code
        const referralCode = randomInt(100000000, 1000000000).toString();
        return await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: data.password ? hashPassword(data.password) : 'auth_handled_by_supabase',
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

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string }) {
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    },

    async getUserPlayedTours(userId: number) {
        return await prisma.userPlayedTour.findMany({
            where: {
                userId: userId,
                status: 'COMPLETED'
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
                        _count: { select: { stops: true, reviews: true } }
                    }
                }
            },
            orderBy: { finishedAt: 'desc' }
        });
    },

    async getUserCreatedTours(userId: number) {
        return await prisma.tour.findMany({
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
                _count: { select: { stops: true, reviews: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};
