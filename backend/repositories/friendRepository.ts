import { Prisma } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import { paginate } from '../utils/pagination';

const friendshipWithUsersArgs = Prisma.validator<Prisma.FriendshipDefaultArgs>()({
    include: {
        requester: {
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                level: true,
                xp: true
            }
        },
        addressee: {
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                level: true,
                xp: true
            }
        },
    },
});

type FriendshipWithUsers = Prisma.FriendshipGetPayload<typeof friendshipWithUsersArgs>;

export const friendRepository = {
    async findFriendships(userId: number, page: number = 1, limit: number = 10) {
        return paginate<FriendshipWithUsers, Prisma.FriendshipFindManyArgs>(
            prisma.friendship,
            {
                where: {
                    OR: [
                        { requesterId: userId, status: 'ACCEPTED' },
                        { addresseeId: userId, status: 'ACCEPTED' },
                    ],
                },
                include: friendshipWithUsersArgs.include,
            },
            page,
            limit
        );
    },

    async findPendingRequests(userId: number) {
        return await prisma.friendship.findMany({
            where: {
                addresseeId: userId,
                status: 'PENDING',
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        level: true
                    }
                },
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
