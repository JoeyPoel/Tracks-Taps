import { tourController } from '@/backend/controllers/tourController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    return await tourController.getTourById(request, params);
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    return await tourController.updateTour(request, params);
}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.email) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await userService.getUserByEmail(authUser.email);
    if (!dbUser) {
        return Response.json({ error: 'User not found' }, { status: 404 });
    }
    return await tourController.deleteTour(request, dbUser.id, params);
}
