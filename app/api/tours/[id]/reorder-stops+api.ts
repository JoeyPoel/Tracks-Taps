import { tourController } from '@/backend/controllers/tourController';

export async function PUT(request: Request, params: { id: string }) {
    return await tourController.reorderStops(request, params);
}
