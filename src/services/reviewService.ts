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

    async getReviewsForTour(tourId: number) {
        const response = await client.get(`/reviews?tourId=${tourId}`);
        return response.data;
    }
};
