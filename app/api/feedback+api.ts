import { feedbackController } from '@/backend/controllers/feedbackController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Clone request to read body for auth check, as request body can only be read once
        const clone = request.clone();
        const body = await clone.json();

        // Security check: Ensure the userId in the body belongs to the authenticated user
        const dbUser = await userService.getUserByEmail(user.email);

        if (!dbUser || dbUser.id !== Number(body.userId)) {
            return Response.json({ error: 'Forbidden: You can only submit feedback for yourself.' }, { status: 403 });
        }

        // Pass original request to controller
        return await feedbackController.createFeedback(request);
    } catch (error) {
        console.error('Error in feedback API auth check:', error);
        return Response.json({ error: 'Invalid Request' }, { status: 400 });
    }
}



