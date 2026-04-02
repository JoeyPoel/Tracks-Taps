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

    async getReviewsForTour(tourId: number, page: number = 1, limit: number = 10) {
        return await reviewRepository.getReviewsForTour(tourId, page, limit);
    },

    async updateReview(id: number, userId: number, data: { content?: string; rating?: number; photos?: string[] }) {
        const review = await reviewRepository.getReviewById(id);
        if (!review) throw new Error('Review not found');
        if (review.authorId !== userId) throw new Error('Unauthorized');

        return await reviewRepository.updateReview(id, data);
    },

    async deleteReview(id: number, userId: number) {
        const review = await reviewRepository.getReviewById(id);
        if (!review) throw new Error('Review not found');
        if (review.authorId !== userId) throw new Error('Unauthorized');

        return await reviewRepository.deleteReview(id);
    }
};
