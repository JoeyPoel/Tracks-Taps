import { mapTourController } from '../../backend-mock/controllers/mapTourController';

export async function GET(request: Request) {
    return await mapTourController.getTours(request);
}
