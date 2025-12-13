import { activeTourController } from '../../../../backend-mock/controllers/activeTourController';
import { verifyAuth } from '../../utils';

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await activeTourController.updateCurrentStop(request);
}
