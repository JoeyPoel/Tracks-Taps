import { adminController } from '@/backend/controllers/adminController';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(request: Request) {
    const authUser = await verifyAuth(request);
    if (!authUser) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
        return await adminController.getStats(request);
    } else if (action === 'pending-tours') {
        return await adminController.getPendingTours(request);
    } else if (action === 'users') {
        return await adminController.getUsers(request);
    } else if (action === 'reviews') {
        return await adminController.getReviews(request);
    } else if (action === 'prompt') {
        return await adminController.getPrompt(request);
    } else if (action === 'purchases') {
        return await adminController.getPurchases(request);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: Request) {
    const authUser = await verifyAuth(request);
    if (!authUser) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action } = body;

        if (action === 'update-tour-status') {
            return await adminController.updateTourStatus(request, body);
        } else if (action === 'toggle-user-admin') {
            return await adminController.toggleUserAdmin(request, body);
        } else if (action === 'delete-user') {
            return await adminController.deleteUser(request, body);
        } else if (action === 'delete-review') {
            return await adminController.deleteReview(request, body);
        } else if (action === 'delete-tour') {
            return await adminController.deleteTour(request, body);
        } else if (action === 'update-user') {
            return await adminController.updateUser(request, body);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in admin POST route:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
