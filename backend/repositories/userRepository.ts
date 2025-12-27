import { randomBytes, scryptSync } from 'crypto';
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
            include: {
                teams: {
                    include: {
                        activeTour: {
                            select: {
                                status: true
                            }
                        }
                    }
                },
                createdTours: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                playedTours: {
                    select: {
                        id: true,
                        status: true,
                        score: true
                    }
                }
            },
        });
    },

    async getUserById(userId: number) {
        return await prisma.user.findUnique({
            where: { id: userId },
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
                },
                createdTours: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                playedTours: {
                    select: {
                        id: true,
                        status: true,
                        score: true
                    }
                }
            },
        });
    },

    async createUser(data: { email: string; name: string; password?: string }) {
        return await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: data.password ? hashPassword(data.password) : 'auth_handled_by_supabase',
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

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string }) {
        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    },

};
