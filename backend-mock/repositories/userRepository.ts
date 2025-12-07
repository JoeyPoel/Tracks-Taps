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

    async addXp(userId: number, amount: number) {
        return await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: amount } },
        });
    },
};
