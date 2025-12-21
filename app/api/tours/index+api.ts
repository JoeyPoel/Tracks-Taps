import { tourController } from '@/backend/controllers/tourController';

export async function GET(request: Request) {
    return await tourController.getAllTours(request);
}

export async function POST(request: Request) {
    return await tourController.createTour(request);
}
