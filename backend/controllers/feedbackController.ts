import { feedbackService } from '../services/feedbackService';

export const feedbackController = {
    async createFeedback(request: Request) {
        try {
            const body = await request.json();
            const { userId, rating, source, tourId, feedback, metadata } = body;

            if (!userId || !rating || !source) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            // Input Validation
            if (Number(rating) < 1 || Number(rating) > 5) {
                return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
            }

            if (feedback && feedback.length > 500) {
                return Response.json({ error: 'Feedback is too long (max 500 chars)' }, { status: 400 });
            }


            const result = await feedbackService.submitFeedback({
                userId: Number(userId),
                rating: Number(rating),
                source: String(source),
                tourId: tourId ? Number(tourId) : undefined,
                feedback: feedback,
                metadata: metadata,
            });

            return Response.json(result);
        } catch (error) {
            console.error('Error in feedbackController.createFeedback:', error);
            return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
};
