import client from '../api/client';

import { TourFilters } from '../types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        const response = await client.get('/tours', { params: filters });
        return response.data;
    },

    async getTourById(id: number) {
        const response = await client.get(`/tour/${id}`);
        return response.data;
    }
};
