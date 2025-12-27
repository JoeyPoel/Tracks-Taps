import { prisma } from "@/src/lib/prisma";

export const gameInviteRepository = {
    async findPendingInvites(userId: number) {
        return await prisma.gameInvite.findMany({
            where: {
                inviteeId: userId,
                status: 'PENDING'
            },
            include: {
                activeTour: {
                    include: {
                        tour: true
                    }
                },
                inviter: {
                    select: { name: true, avatarUrl: true }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    },

    async findById(inviteId: number) {
        return await prisma.gameInvite.findUnique({
            where: { id: inviteId },
        });
    },

    async updateStatus(inviteId: number, status: string) {
        return await prisma.gameInvite.update({
            where: { id: inviteId },
            data: { status },
        });
    },

    async create(data: {
        activeTourId: number;
        inviterId: number;
        inviteeId: number;
    }) {
        return await prisma.gameInvite.create({
            data: {
                activeTourId: data.activeTourId,
                inviterId: data.inviterId,
                inviteeId: data.inviteeId,
                status: 'PENDING'
            }
        });
    }
};
