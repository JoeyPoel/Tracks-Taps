import { reviewService } from '../services/reviewService';

export const reviewController = {
    async getReviews(request: Request) {
        const { searchParams } = new URL(request.url);
        const tourId = searchParams.get('tourId');

        if (!tourId) {
            return Response.json({ error: 'Missing tourId' }, { status: 400 });
        }

        try {
            const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
            const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

            const reviews = await reviewService.getReviewsForTour(parseInt(tourId), page, limit);
            return Response.json(reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return Response.json({ error: 'Failed to fetch reviews' }, { status: 500 });
        }
    },

    async createReview(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { tourId, userId, content, rating, photos } = body;

            if (!tourId || !userId || !content || !rating) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const review = await reviewService.createReview({
                tourId: Number(tourId),
                userId: Number(userId),
                content,
                rating: Number(rating),
                photos
            });
            return Response.json(review);
        } catch (error) {
            console.error('Error creating review:', error);
            return Response.json({ error: 'Failed to create review' }, { status: 500 });
        }
    }
};
