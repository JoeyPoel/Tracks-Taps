import { reviewController } from '@/backend/controllers/reviewController';
import { verifyAuth } from '@/backend/utils/auth';
import { userService } from '../../backend/services/userService';

export async function GET(request: Request) {
    return await reviewController.getReviews(request);
}

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();

        // Security check: Ensure the userId in the body belongs to the authenticated user
        const dbUser = await userService.getUserByEmail(user.email);

        if (!dbUser || dbUser.id !== Number(body.userId)) {
            return Response.json({ error: 'Forbidden: You can only post reviews for yourself.' }, { status: 403 });
        }

        return await reviewController.createReview(request, body);
    } catch (_error) {
        return Response.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
