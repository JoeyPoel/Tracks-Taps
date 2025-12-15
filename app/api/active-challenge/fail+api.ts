import { activeTourController } from '@/backend/controllers/activeTourController';
import { verifyAuth } from '../_utils';

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await activeTourController.failChallenge(request);
}
