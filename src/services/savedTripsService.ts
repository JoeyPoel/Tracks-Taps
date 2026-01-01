import client from '@/src/api/apiClient';
import { Tour } from '../types/models';

export interface SavedTrip {
    id: number;
    name: string;
    userId: number;
    tours: Tour[];
    updatedAt: string;
}

export const savedTripsService = {
    async getAll() {
        const response = await client.get('/saved-trips');
        return response.data;
    },

    async getById(id: number) {
        const response = await client.get(`/saved-trips/${id}`);
        return response.data;
    },

    async create(name: string) {
        const response = await client.post('/saved-trips', { name });
        return response.data;
    },

    async delete(id: number) {
        const response = await client.delete(`/saved-trips/${id}`);
        return response.data;
    },

    async updateName(id: number, name: string) {
        const response = await client.patch(`/saved-trips/${id}`, { name });
        return response.data;
    },

    async addTour(listId: number, tourId: number) {
        const response = await client.post(`/saved-trips/${listId}/tours/${tourId}`);
        return response.data;
    },

    async removeTour(listId: number, tourId: number) {
        const response = await client.delete(`/saved-trips/${listId}/tours/${tourId}`);
        return response.data;
    },

    async updateOrder(id: number, tourIds: number[]) {
        const response = await client.patch(`/saved-trips/${id}`, { tourIds });
        return response.data;
    }
};
