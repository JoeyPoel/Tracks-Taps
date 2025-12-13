import { userController } from '../../../backend-mock/controllers/userController';
import { verifyAuth } from '../utils';

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return await userController.addXp(request);
}
