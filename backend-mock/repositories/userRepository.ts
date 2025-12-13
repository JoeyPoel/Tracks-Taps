import { prisma } from '../../src/lib/prisma';

export const userRepository = {
    async getUserProfile(userId: number) {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                teams: {
                    include: {
                        activeTour: {
                            select: {
                                status: true
                            }
                        }
                    }
                }
            },
        });
    },

    async getUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                teams: {
                    include: {
                        activeTour: {
                            select: {
                                status: true
                            }
                        }
                    }
                }
            },
        });
    },

    async createUser(data: { email: string; name: string }) {
        return await prisma.user.create({
            data: {
                ...data,
                passwordHash: 'placeholder', // Since auth is handled by Supabase
                xp: 0,
                tokens: 0,
                level: 1,
            },
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

};
