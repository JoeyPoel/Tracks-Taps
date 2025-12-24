import { activeTourController } from '@/backend/controllers/activeTourController';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const user = await verifyAuth(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await activeTourController.getActiveTourProgress(request, params);
}
