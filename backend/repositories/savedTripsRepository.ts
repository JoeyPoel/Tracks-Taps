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
        const list = await prisma.tourList.findUnique({
            where: { id },
            include: {
                tours: {
                    include: {
                        author: { select: { name: true, avatarUrl: true } }
                    }
                },
            },
        });

        if (!list) return null;

        // Sort tours based on tourOrder
        if (list.tourOrder && list.tourOrder.length > 0) {
            const orderMap = new Map(list.tourOrder.map((id, index) => [id, index]));
            list.tours.sort((a, b) => {
                const indexA = orderMap.get(a.id) ?? Infinity;
                const indexB = orderMap.get(b.id) ?? Infinity;
                return indexA - indexB;
            });
        }

        return list;
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
        // Fetch current list to append to order
        const currentList = await prisma.tourList.findUnique({ where: { id: listId }, select: { tourOrder: true } });
        const currentOrder = currentList?.tourOrder || [];
        // Prevent duplicates in order array
        const newOrder = currentOrder.includes(tourId) ? currentOrder : [...currentOrder, tourId];

        return prisma.tourList.update({
            where: { id: listId },
            data: {
                tours: { connect: { id: tourId } },
                tourOrder: newOrder
            },
            include: { tours: true },
        });
    },

    async removeTour(listId: number, tourId: number) {
        // Fetch current list to remove from order
        const currentList = await prisma.tourList.findUnique({ where: { id: listId }, select: { tourOrder: true } });
        const newOrder = (currentList?.tourOrder || []).filter(id => id !== tourId);

        return prisma.tourList.update({
            where: { id: listId },
            data: {
                tours: { disconnect: { id: tourId } },
                tourOrder: newOrder
            },
            include: { tours: true },
        });
    },

    async updateOrder(id: number, tourIds: number[]) {
        return prisma.tourList.update({
            where: { id },
            data: { tourOrder: tourIds },
            include: { tours: true },
        });
    },
};
