import { tourController } from '@/backend/controllers/tourController';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    return await tourController.getTourById(request, params);
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    return await tourController.updateTour(request, params);
}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const authUser = await verifyAuth(request);
    if (!authUser) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return await tourController.deleteTour(request, Number(authUser.id), params);
}
