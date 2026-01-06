import client from '@/src/api/apiClient';

export const userService = {
    async getUserProfile(userId: number) {
        const response = await client.get(`/user?userId=${userId}`);
        return response.data;
    },

    async getUserPlayedTours(userId: number) {
        const response = await client.get(`/user?userId=${userId}&type=played`);
        return response.data; // Expecting UserPlayedTour[] with tour included
    },

    async getUserCreatedTours(userId: number) {
        const response = await client.get(`/user?userId=${userId}&type=created`);
        return response.data; // Expecting Tour[]
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
    }
};
