import client from '@/src/api/apiClient';

export const userService = {
    async getUserProfile(userId: number) {
        const response = await client.get(`/user?userId=${userId}`);
        return response.data;
    },

    async getUserPlayedTours(userId: number, page: number = 1, limit: number = 10) {
        const response = await client.get(`/user?userId=${userId}&type=played&page=${page}&limit=${limit}`);
        return response.data;
    },

    async getUserCreatedTours(userId: number, page: number = 1, limit: number = 10) {
        const response = await client.get(`/user?userId=${userId}&type=created&page=${page}&limit=${limit}`);
        return response.data;
    },

    async getUserByEmail(email: string) {
        const response = await client.get(`/user?email=${email}`);
        return response.data;
    },

    async getUserByAuthId(authId: string, email?: string) {
        // If email is provided, pass it so the backend can create the user using authId + email. If not, just authId.
        const url = email ? `/user?authId=${authId}&email=${encodeURIComponent(email)}` : `/user?authId=${authId}`;
        const response = await client.get(url);
        return response.data;
    },

    async searchUsers(query: string, page: number = 1, limit: number = 20) {
        const response = await client.get(`/user?query=${query}&page=${page}&limit=${limit}`);
        return response.data;
    },

    async addXp(userId: number, amount: number) {
        const response = await client.post('/user/xp', { userId, amount });
        return response.data;
    },

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string }) {
        const response = await client.post('/user', { action: 'update-user', userId, ...data });
        return response.data;
    },

    async verifyPurchase(userId: number, appUserId: string, transactionId?: string) {
        // Updated to use the new route we created
        const response = await client.post('/user/verify-purchase', { userId, appUserId, transactionId });
        return response.data;
    },

    async deleteUser(userId: number) {
        const response = await client.post('/user', { action: 'delete-user', userId });
        return response.data;
    }
};
