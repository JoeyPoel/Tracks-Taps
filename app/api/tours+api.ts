import { tourController } from '../../backend-mock/controllers/tourController';

export async function GET(request: Request) {
    return await tourController.getAllTours(request);
}
