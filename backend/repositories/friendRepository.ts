import { prisma } from '../../src/lib/prisma';

export const friendRepository = {
    async findFriendships(userId: number) {
        return await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: 'ACCEPTED' },
                    { addresseeId: userId, status: 'ACCEPTED' },
                ],
            },
            include: {
                requester: true,
                addressee: true,
            },
        });
    },

    async findPendingRequests(userId: number) {
        return await prisma.friendship.findMany({
            where: {
                addresseeId: userId,
                status: 'PENDING',
            },
            include: {
                requester: true,
            },
        });
    },

    async findFriendship(userId1: number, userId2: number) {
        return await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId1, addresseeId: userId2 },
                    { requesterId: userId2, addresseeId: userId1 },
                ],
            },
        });
    },

    async createFriendship(requesterId: number, addresseeId: number) {
        return await prisma.friendship.create({
            data: {
                requesterId,
                addresseeId,
                status: 'PENDING',
            },
        });
    },

    async updateFriendshipStatus(id: number, status: 'ACCEPTED' | 'DECLINED') {
        return await prisma.friendship.update({
            where: { id },
            data: { status },
        });
    },

    async deleteFriendship(id: number) {
        return await prisma.friendship.delete({
            where: { id },
        });
    },
    async updateRequestStatus(id: number, status: 'ACCEPTED' | 'DECLINED') {
        return this.updateFriendshipStatus(id, status);
    },

    async getRequestById(id: number) {
        return await prisma.friendship.findUnique({
            where: { id }
        });
    },
};
