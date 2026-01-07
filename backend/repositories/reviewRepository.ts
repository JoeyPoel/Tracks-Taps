import { prisma } from '../../src/lib/prisma';
import { paginate } from '../utils/pagination';

export const reviewRepository = {
    async createReview(data: {
        tourId: number;
        userId: number;
        content: string;
        rating: number;
        photos?: string[];
    }) {
        return await prisma.review.create({
            data: {
                content: data.content,
                rating: data.rating,
                photos: data.photos || [],
                tour: { connect: { id: data.tourId } },
                author: { connect: { id: data.userId } },
            },
        });
    },

    async getReviewsForTour(tourId: number, page: number = 1, limit: number = 10) {
        return paginate(
            prisma.review,
            {
                where: { tourId },
                include: {
                    author: {
                        select: {
                            name: true,
                            avatarUrl: true
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            page,
            limit
        );
    },
};
