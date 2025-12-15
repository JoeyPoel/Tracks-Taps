import { reviewRepository } from '../repositories/reviewRepository';

export const reviewService = {
    async createReview(data: {
        tourId: number;
        userId: number;
        content: string;
        rating: number;
        photos?: string[];
    }) {
        return await reviewRepository.createReview(data);
    },

    async getReviewsForTour(tourId: number) {
        return await reviewRepository.getReviewsForTour(tourId);
    },
};
