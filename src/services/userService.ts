import client from '../api/client';

export const userService = {
    async getUserProfile(userId: number) {
        const response = await client.get(`/user?userId=${userId}`);
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
    }
};
