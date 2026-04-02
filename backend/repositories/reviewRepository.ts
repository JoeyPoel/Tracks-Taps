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
                            id: true,
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

    async getReviewById(id: number) {
        return await prisma.review.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true
                    }
                }
            }
        });
    },

    async updateReview(id: number, data: { content?: string; rating?: number; photos?: string[] }) {
        return await prisma.review.update({
            where: { id },
            data: {
                content: data.content,
                rating: data.rating,
                photos: data.photos,
            },
        });
    },

    async deleteReview(id: number) {
        return await prisma.review.delete({
            where: { id },
        });
    },

    async getReviewsForUser(userId: number, page: number = 1, limit: number = 10) {
        return paginate(
            prisma.review,
            {
                where: { authorId: userId },
                include: {
                    tour: {
                        select: {
                            id: true,
                            title: true,
                            imageUrl: true,
                            location: true
                        }
                    },
                    author: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            },
            page,
            limit
        );
    },
};
