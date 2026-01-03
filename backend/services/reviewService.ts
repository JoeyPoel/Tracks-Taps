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

    async getReviewsForTour(tourId: number) {
        return await reviewRepository.getReviewsForTour(tourId);
    },
};
