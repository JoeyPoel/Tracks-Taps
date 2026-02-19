import { activeTourRepository } from '../repositories/activeTourRepository';
import { gameInviteRepository } from '../repositories/gameInviteRepository';
import { userRepository } from '../repositories/userRepository';
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
        await gameInviteRepository.create({
            activeTourId: activeTourId,
            inviterId: senderId,
            inviteeId: target.id
        });

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
            // Check if user exists (optional optimization: findMany)
            // For now, simpler to just create invite. Foreign key constraint will fail if user doesn't exist?
            // Safer to check or rely on repository.
            // Let's assume valid IDs for now or catch errors.

            await gameInviteRepository.create({
                activeTourId: activeTourId,
                inviterId: senderId,
                inviteeId: targetId
            });
        }));

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        return { success: true, count: successCount };
    }
};
