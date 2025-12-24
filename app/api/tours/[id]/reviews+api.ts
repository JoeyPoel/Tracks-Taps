import { reviewService } from '@/backend/services/reviewService';
import { verifyAuth } from '@/backend/utils/auth';
import { userRepository } from '../../../../backend/repositories/userRepository';

export async function POST(request: Request, context: any) {
    console.log('API POST /reviews called');
    console.log('Context:', JSON.stringify(context));

    // Robustly get params
    const params = context?.params;
    let id = params?.id;

    // Fallback: extract from URL if params.id is missing
    if (!id) {
        console.warn('params.id missing, attempting to parse from URL');
        const url = new URL(request.url);
        // Path should be something like /api/tours/123/reviews
        const segments = url.pathname.split('/');
        // finding "tours", the next one should be id
        const tourIndex = segments.indexOf('tours');
        if (tourIndex !== -1 && segments[tourIndex + 1]) {
            id = segments[tourIndex + 1];
        }
    }

    if (!id) {
        console.error('Could not determine tour ID');
        return Response.json({ error: 'Missing tour ID' }, { status: 400 });
    }

    try {
        const user = await verifyAuth(request);
        if (!user || !user.email) {
            console.log('Unauthorized request');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const localUser = await userRepository.getUserByEmail(user.email);
        if (!localUser) {
            console.log('User not found in DB:', user.email);
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { rating, content, photos } = body;

        console.log(`Creating review for tour ${id} by user ${localUser.id}`);

        if (!rating || !content) {
            return Response.json({ error: 'Missing rating or content' }, { status: 400 });
        }

        const review = await reviewService.createReview({
            tourId: Number(id),
            userId: localUser.id,
            rating: Number(rating),
            content,
            photos: photos || []
        });

        return Response.json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
