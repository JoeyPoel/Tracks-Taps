import { reviewRepository } from '../repositories/reviewRepository';
import { achievementService } from './achievementService';

export const reviewService = {
    async createReview(data: {
        tourId: number;
        userId: number;
        content: string;
        rating: number;
        photos?: string[];
    }) {
        const review = await reviewRepository.createReview(data);
        await achievementService.checkReviewCount(data.userId);
        return review;
    },

    async getReviewsForTour(tourId: number, page: number = 1, limit: number = 20) {
        return await reviewRepository.getReviewsForTour(tourId, page, limit);
    },
};
