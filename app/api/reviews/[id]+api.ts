import { reviewController } from '@/backend/controllers/reviewController';
import { userRepository } from '@/backend/repositories/userRepository';
import { verifyAuth } from '@/backend/utils/auth';

export async function PATCH(request: Request, context: any) {
    const params = context?.params;
    const id = params?.id;

    if (!id) {
        return Response.json({ error: 'Missing review ID' }, { status: 400 });
    }

    try {
        const user = await verifyAuth(request);
        if (!user || !user.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const localUser = await userRepository.getUserByEmail(user.email);
        if (!localUser) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return await reviewController.updateReview(request, { id }, localUser.id);
    } catch (error) {
        console.error('API PATCH /reviews/[id] error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: any) {
    const params = context?.params;
    const id = params?.id;

    if (!id) {
        return Response.json({ error: 'Missing review ID' }, { status: 400 });
    }

    try {
        const user = await verifyAuth(request);
        if (!user || !user.email) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const localUser = await userRepository.getUserByEmail(user.email);
        if (!localUser) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        return await reviewController.deleteReview(request, { id }, localUser.id);
    } catch (error) {
        console.error('API DELETE /reviews/[id] error:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
