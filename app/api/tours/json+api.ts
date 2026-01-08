import { tourController } from '@/backend/controllers/tourController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function POST(request: Request) {
    const user = await verifyAuth(request);
    if (!user || !user.email) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) {
        return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return await tourController.createTourByJson(request, dbUser.id);
}
