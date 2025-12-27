import { prisma } from '@/src/lib/prisma';

export const feedbackRepository = {
    async create(data: {
        userId: number;
        rating: number;
        source: string;
        tourId?: number;
        feedback?: string;
        metadata?: any;
    }) {
        return await prisma.feedback.create({
            data: {
                userId: data.userId,
                rating: data.rating,
                source: data.source,
                tourId: data.tourId || null,
                feedback: data.feedback || null,
                metadata: data.metadata || null,
            },
        });

    }
};
