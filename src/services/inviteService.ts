import client from '@/src/api/apiClient';

export interface Invite {
    id: number;
    type: 'GAME_INVITE';
    title: string;
    message: string;
    parsedData: {
        tourId: number;
        tourName?: string;
        inviterName?: string;
        activeTourId: number;
    };
    createdAt: string;
}

export const inviteService = {
    async fetchInvites(): Promise<Invite[]> {
        const response = await client.get('/invites');
        return response.data;
    },

    async acceptInvite(inviteId: number): Promise<{ success: true; activeTourId: number }> {
        const response = await client.post('/invites', {
            action: 'accept',
            inviteId
        });
        return response.data;
    },

    async declineInvite(inviteId: number): Promise<{ success: true }> {
        const response = await client.post('/invites', {
            action: 'decline',
            inviteId
        });
        return response.data;
    },

    async sendInvite(targetEmail: string, activeTourId: number): Promise<{ success: true }> {
        const response = await client.post('/invites', {
            action: 'send',
            targetEmail,
            activeTourId
        });
        return response.data;
    }
};
