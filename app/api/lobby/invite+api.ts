import { gameInviteController } from '@/backend/controllers/gameInviteController';
import { verifyAuth } from '@/backend/utils/auth';

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { friendIds, activeTourId } = body;

        if (!friendIds || !Array.isArray(friendIds) || !activeTourId) {
            return Response.json({ error: 'Missing friendIds array or activeTourId' }, { status: 400 });
        }

        return await gameInviteController.inviteFriends(user.email, friendIds, Number(activeTourId));

    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({ error: 'Bad Request' }, { status: 400 });
    }
}
