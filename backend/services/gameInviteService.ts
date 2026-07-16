import { prisma } from '../../src/lib/prisma';
import { activeTourRepository } from '../repositories/activeTourRepository';
import { gameInviteRepository } from '../repositories/gameInviteRepository';
import { userRepository } from '../repositories/userRepository';
import { sendExpoPushNotifications } from '../utils/pushSender';
import { activeTourService } from './activeTourService';

export const gameInviteService = {
    async getInvites(userId: number) {
        const invites = await gameInviteRepository.findPendingInvites(userId);

        // Transform for frontend
        return invites.map(invite => ({
            id: invite.id,
            type: 'GAME_INVITE',
            title: `Invite to ${invite.activeTour.tour.title}`,
            message: `${invite.inviter.name} invited you!`,
            createdAt: invite.createdAt,
            parsedData: {
                tourId: invite.activeTourId,
                tourName: invite.activeTour.tour.title,
                inviterName: invite.inviter.name,
                activeTourId: invite.activeTourId
            }
        }));
    },

    async acceptInvite(inviteId: number, userId: number) {
        const invite = await gameInviteRepository.findById(inviteId);

        if (!invite) throw new Error('Invite not found');
        if (invite.inviteeId !== userId) throw new Error('Unauthorized');
        if (invite.status !== 'PENDING') throw new Error('Invite is no longer pending');

        // Join the tour
        await activeTourService.joinTour(invite.activeTourId, userId);

        // Mark as accepted
        await gameInviteRepository.updateStatus(inviteId, 'ACCEPTED');

        return { success: true, activeTourId: invite.activeTourId };
    },

    async declineInvite(inviteId: number, userId: number) {
        const invite = await gameInviteRepository.findById(inviteId);

        if (!invite) throw new Error('Invite not found');
        if (invite.inviteeId !== userId) throw new Error('Unauthorized');

        // Mark as declined
        await gameInviteRepository.updateStatus(inviteId, 'DECLINED');

        return { success: true };
    },

    async sendInvite(senderId: number, targetEmail: string, activeTourId: number) {
        const sender = await userRepository.getUserProfile(senderId);
        const target = await userRepository.getUserByEmail(targetEmail);
        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);

        if (!sender) throw new Error("Sender not found");
        if (!target) throw new Error("User not found");
        if (!activeTour) throw new Error("Tour not found");
        if (activeTour.status !== 'WAITING' && activeTour.status !== 'IN_PROGRESS') {
            throw new Error("Cannot invite to an expired or finished tour");
        }

        // Prevent self-invite
        if (sender.id === target.id) throw new Error("Cannot invite yourself");

        // Create the invite
        const inviteResult = await gameInviteRepository.create({
            activeTourId: activeTourId,
            inviterId: senderId,
            inviteeId: target.id
        });

        // Send push notification in background
        prisma.userPushToken.findMany({
            where: { userId: target.id }
        }).then(async (tokens) => {
            if (tokens.length > 0) {
                const payload = tokens.map(t => ({
                    to: [t.pushToken],
                    title: 'New Tour Invite! 🍻',
                    body: `${sender.name || 'Someone'} wants you to join the tour: '${activeTour.tour?.title || 'Tour'}'. Tap to accept!`,
                    data: { screen: 'game-invite', inviteId: activeTourId }
                }));
                await sendExpoPushNotifications(payload);
            }
        }).catch(err => console.error('[gameInviteService] Error sending game invite push:', err));

        return { success: true };
    },

    async sendInvitesToUsers(senderId: number, targetUserIds: number[], activeTourId: number) {
        if (!targetUserIds || targetUserIds.length === 0) return { success: true, count: 0 };

        const sender = await userRepository.getUserProfile(senderId);
        if (!sender) throw new Error("Sender not found");

        const activeTour = await activeTourRepository.findActiveTourById(activeTourId);
        if (!activeTour) throw new Error("Tour not found");
        if (activeTour.status !== 'WAITING' && activeTour.status !== 'IN_PROGRESS') {
            // Or just return success: false? But throwing is clearer for the caller
            throw new Error("Cannot invite to an expired or finished tour");
        }

        // Filter out self if present
        const validTargetIds = targetUserIds.filter(id => id !== senderId);

        // Process invites in parallel
        const results = await Promise.allSettled(validTargetIds.map(async (targetId) => {
            await gameInviteRepository.create({
                activeTourId: activeTourId,
                inviterId: senderId,
                inviteeId: targetId
            });
        }));

        // Send push notifications in background for valid invitees
        prisma.userPushToken.findMany({
            where: { userId: { in: validTargetIds } }
        }).then(async (tokens) => {
            if (tokens.length > 0) {
                const payload = tokens.map(t => ({
                    to: [t.pushToken],
                    title: 'New Tour Invite! 🍻',
                    body: `${sender.name || 'Someone'} wants you to join the tour: '${activeTour.tour?.title || 'Tour'}'. Tap to accept!`,
                    data: { screen: 'game-invite', inviteId: activeTourId }
                }));
                await sendExpoPushNotifications(payload);
            }
        }).catch(err => console.error('[gameInviteService] Error sending batch game invite push:', err));

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        return { success: true, count: successCount };
    },

    /**
     * Cancels a pending game invite by deleting it.
     * @param senderId The user ID of the host/sender who invited
     * @param inviteeId The user ID of the friend who was invited
     * @param activeTourId The ID of the active tour session
     * @returns Object indicating success status
     */
    async cancelInvite(senderId: number, inviteeId: number, activeTourId: number) {
        const invite = await prisma.gameInvite.findFirst({
            where: {
                activeTourId,
                inviterId: senderId,
                inviteeId,
                status: 'PENDING'
            }
        });

        if (!invite) throw new Error('Invite not found');

        await prisma.gameInvite.delete({
            where: { id: invite.id }
        });

        return { success: true };
    }
};
