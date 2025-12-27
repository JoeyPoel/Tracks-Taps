import { gameInviteController } from '@/backend/controllers/gameInviteController';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    return await gameInviteController.getInvites(user.email);
}

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const { action, inviteId, targetEmail, activeTourId } = body;

        if (action === 'send') {
            if (!targetEmail || !activeTourId) return Response.json({ error: 'Missing targetEmail or activeTourId' }, { status: 400 });
            return await gameInviteController.sendInvite(user.email, targetEmail, Number(activeTourId));
        } else if (action === 'accept' || action === 'decline') {
            if (!inviteId) return Response.json({ error: 'Missing inviteId' }, { status: 400 });
            return await gameInviteController.handleResponse(user.email, action, Number(inviteId));
        } else {
            return Response.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error: any) {
        console.error('API Error:', error);
        return Response.json({ error: 'Bad Request' }, { status: 400 });
    }
}


