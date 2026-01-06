import { prisma } from '../../src/lib/prisma';

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

    async getReviewsForTour(tourId: number, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        return await prisma.review.findMany({
            where: { tourId },
            include: {
                author: {
                    select: {
                        name: true,
                        // avatarUrl if we add it to User model later
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
        });
    },
};
