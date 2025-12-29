import { prisma } from '../../src/lib/prisma';

export const savedTripsRepository = {
    async create(userId: number, name: string) {
        return prisma.tourList.create({
            data: {
                userId,
                name,
            },
            include: {
                tours: true,
            },
        });
    },

    async findByUserId(userId: number) {
        return prisma.tourList.findMany({
            where: { userId },
            include: {
                tours: {
                    include: {
                        author: {
                            select: { name: true, avatarUrl: true }
                        }
                    }
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    },

    async findById(id: number) {
        return prisma.tourList.findUnique({
            where: { id },
            include: {
                tours: {
                    include: {
                        author: {
                            select: { name: true, avatarUrl: true }
                        }
                    }
                },
            },
        });
    },

    async delete(id: number) {
        return prisma.tourList.delete({
            where: { id },
        });
    },

    async updateName(id: number, name: string) {
        return prisma.tourList.update({
            where: { id },
            data: { name },
        });
    },

    async addTour(listId: number, tourId: number) {
        return prisma.tourList.update({
            where: { id: listId },
            data: {
                tours: {
                    connect: { id: tourId },
                },
            },
            include: {
                tours: true,
            },
        });
    },

    async removeTour(listId: number, tourId: number) {
        return prisma.tourList.update({
            where: { id: listId },
            data: {
                tours: {
                    disconnect: { id: tourId },
                },
            },
            include: {
                tours: true,
            },
        });
    },
};
