import client from '../api/client';

export const tourService = {
    async getAllTours() {
        const response = await client.get('/tours');
        return response.data;
    },

    async getTourById(id: number) {
        const response = await client.get(`/tour/${id}`);
        return response.data;
    }
};
