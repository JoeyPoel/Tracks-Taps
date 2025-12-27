import { gameInviteService } from '../services/gameInviteService';
import { userService } from '../services/userService';

// Helper to standardise responses
const jsonResponse = (data: any, status = 200) => Response.json(data, { status });
const errorResponse = (message: string, status = 400) => Response.json({ error: message }, { status });

export const gameInviteController = {
    async getInvites(userEmail: string) {
        try {
            const dbUser = await userService.getUserByEmail(userEmail);
            if (!dbUser) return errorResponse('User not found', 404);

            const invites = await gameInviteService.getInvites(dbUser.id);
            return jsonResponse(invites);
        } catch (error: any) {
            console.error('Controller Error (getInvites):', error);
            return errorResponse(error.message || 'Internal Server Error', 500);
        }
    },

    async handleResponse(userEmail: string, action: string, inviteId: number) {
        try {
            const dbUser = await userService.getUserByEmail(userEmail);
            if (!dbUser) return errorResponse('User not found', 404);

            if (action === 'accept') {
                const result = await gameInviteService.acceptInvite(inviteId, dbUser.id);
                return jsonResponse(result);
            } else if (action === 'decline') {
                const result = await gameInviteService.declineInvite(inviteId, dbUser.id);
                return jsonResponse(result);
            } else {
                return errorResponse('Invalid action');
            }
        } catch (error: any) {
            console.error('Controller Error (handleResponse):', error);
            return errorResponse(error.message || 'Failed to process invite');
        }
    },

    async sendInvite(userEmail: string, targetEmail: string, activeTourId: number) {
        try {
            const dbUser = await userService.getUserByEmail(userEmail);
            if (!dbUser) return errorResponse('User not found', 404);

            const result = await gameInviteService.sendInvite(dbUser.id, targetEmail, activeTourId);
            return jsonResponse(result);
        } catch (error: any) {
            console.error('Controller Error (sendInvite):', error);
            return errorResponse(error.message || 'Failed to send invite');
        }
    }
};
