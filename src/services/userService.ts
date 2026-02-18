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

    async addXp(userId: number, amount: number) {
        const response = await client.post('/user/xp', { userId, amount });
        return response.data;
    },

    async updateUser(userId: number, data: { name?: string; avatarUrl?: string }) {
        const response = await client.post('/user', { action: 'update-user', userId, ...data });
        return response.data;
    },

    async verifyPurchase(userId: number, appUserId: string) {
        // Updated to use the new route we created
        const response = await client.post('/user/verify-purchase', { userId, appUserId });
        return response.data;
    }
};
