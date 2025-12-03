import { tourController } from '../../../backend-mock/controllers/tourController';

export async function GET(request: Request, params: { id: string }) {
    return await tourController.getTourById(request, params);
}
