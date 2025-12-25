import client from '@/src/api/apiClient';

export interface Friend {
    id: number;
    email: string;
    name?: string;
    avatar?: string;
}

export interface FriendRequest {
    id: number;
    fromUser: Friend;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    createdAt: string;
}

export const friendService = {
    async getFriends(): Promise<Friend[]> {
        const response = await client.get('/friends');
        return response.data;
    },

    async getFriendRequests(): Promise<FriendRequest[]> {
        const response = await client.get('/friends/request');
        return response.data;
    },

    async sendFriendRequest(email: string): Promise<{ message: string; requestId?: number }> {
        const response = await client.post('/friends/request', { email });
        return response.data;
    },

    async respondToRequest(requestId: number, action: 'ACCEPT' | 'DECLINE'): Promise<{ message: string }> {
        const response = await client.post('/friends/respond', { requestId, action });
        return response.data;
    },

    async sendLobbyInvite(friendIds: number[], activeTourId: number): Promise<{ message: string }> {
        const response = await client.post('/lobby/invite', { friendIds, activeTourId });
        return response.data;
    }
};
