import client from '@/src/api/apiClient';

export const reviewService = {
    async createReview(data: {
        tourId: number;
        userId: number;
        content: string;
        rating: number;
        photos?: string[];
    }) {
        const response = await client.post('/reviews', data);
        return response.data;
    },

    async getReviewsForTour(tourId: number, page: number = 1, limit: number = 10) {
        const response = await client.get(`/reviews?tourId=${tourId}&page=${page}&limit=${limit}`);
        return response.data;
    },

    async updateReview(id: string | number, data: { content?: string; rating?: number; photos?: string[] }) {
        const response = await client.patch(`/reviews/${id}`, data);
        return response.data;
    },

    async deleteReview(id: string | number) {
        const response = await client.delete(`/reviews/${id}`);
        return response.data;
    }
};
