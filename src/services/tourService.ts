import client from '@/src/api/apiClient';

import { TourFilters } from '../types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        const response = await client.get('/tours', { params: filters });
        return response.data;
    },

    async getTourById(id: number) {
        const response = await client.get(`/tours/${id}`);
        return response.data;
    },

    async createReview(tourId: number, data: { rating: number; content: string; photos?: string[] }) {
        const response = await client.post(`/tours/${tourId}/reviews`, data);
        return response.data;
    },

    async createTour(data: any) {
        const response = await client.post('/tours', data);
        return response.data;
    },

    async updateTour(id: number, data: any) {
        const response = await client.put(`/tours/${id}`, data);
        return response.data;
    }
};
