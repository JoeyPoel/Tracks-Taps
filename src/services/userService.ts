import { prisma } from '../lib/prisma';

export const userService = {
    async getUserProfile(userId: number) {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                participations: {
                    include: {
                        tour: true,
                    },
                },
                createdTours: true,
            },
        });
    },

    async getUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                participations: {
                    include: {
                        tour: true,
                    },
                },
                createdTours: true,
            },
        });
    },
};
