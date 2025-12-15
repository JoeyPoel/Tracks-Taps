import { mapTourController } from '@/backend/controllers/mapTourController';

export async function GET(request: Request) {
    return await mapTourController.getTours(request);
}
