import { activeTourController } from '../../../../backend-mock/controllers/activeTourController';
import { verifyAuth } from '../../_utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const user = await verifyAuth(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await activeTourController.getActiveTourProgress(request, params);
}
