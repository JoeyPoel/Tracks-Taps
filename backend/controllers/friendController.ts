import { verifyAuth } from '@/backend/utils/auth';
import { friendService } from '../services/friendService';

export const friendController = {
    async getFriends(request: Request) {
        try {
            const user = await verifyAuth(request);
            if (!user || !user.email) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const friends = await friendService.getFriends(user.email);
            return Response.json(friends);
        } catch (error: any) {
            console.error('Error fetching friends:', error);
            if (error.message === 'User not found') {
                return Response.json({ error: error.message }, { status: 404 });
            }
            return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    },

    async getRequests(request: Request) {
        try {
            const user = await verifyAuth(request);
            if (!user || !user.email) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const requests = await friendService.getRequests(user.email);
            return Response.json(requests);
        } catch (error: any) {
            console.error('Error fetching requests:', error);
            if (error.message === 'User not found') {
                return Response.json({ error: error.message }, { status: 404 });
            }
            return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    },

    async sendRequest(request: Request) {
        try {
            const user = await verifyAuth(request);
            if (!user || !user.email) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const body = await request.json();
            const { email: targetEmail } = body;

            if (!targetEmail) {
                return Response.json({ error: 'Target email is required' }, { status: 400 });
            }

            const result = await friendService.sendRequest(user.email, targetEmail);
            return Response.json(result);
        } catch (error: any) {
            console.error('Error sending request:', error);
            if (error.message === 'User not found' || error.message === 'Cannot add yourself' || error.message === 'Already friends' || error.message === 'Request already pending') {
                return Response.json({ error: error.message }, { status: 400 });
            }
            return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    },

    async respondToRequest(request: Request) {
        try {
            const user = await verifyAuth(request); // Verify auth conceptually, though we trust the requestId linkage for now or should verify ownership
            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const body = await request.json();
            const { requestId, action } = body;

            if (!requestId || !action) {
                return Response.json({ error: 'Missing requestId or action' }, { status: 400 });
            }

            const result = await friendService.respondToRequest(Number(requestId), action);
            return Response.json(result);
        } catch (error: any) {
            console.error('Error responding to request:', error);
            return Response.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }
};
