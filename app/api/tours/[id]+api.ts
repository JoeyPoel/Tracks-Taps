import { tourController } from '@/backend/controllers/tourController';

export async function GET(request: Request, params: { id: string }) {
    return await tourController.getTourById(request, params);
}
export async function PUT(request: Request, params: { id: string }) {
    return await tourController.updateTour(request, params);
}
