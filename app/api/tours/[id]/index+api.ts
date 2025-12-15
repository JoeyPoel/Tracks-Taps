import { tourController } from '@/backend/controllers/tourController';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    return await tourController.getTourById(request, params);
}
