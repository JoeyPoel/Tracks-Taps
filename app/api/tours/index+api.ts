import { tourController } from '../../../backend-mock/controllers/tourController';

export async function GET() {
    return await tourController.getAllTours();
}
