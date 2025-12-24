import { activeTourController } from '@/backend/controllers/activeTourController';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(request: Request) {
    const user = await verifyAuth(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await activeTourController.getActiveTours(request);
}

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await activeTourController.startTour(request);
}
