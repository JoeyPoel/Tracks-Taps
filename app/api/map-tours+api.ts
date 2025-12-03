import { mapTourController } from '../../backend-mock/controllers/mapTourController';

export async function GET() {
    return await mapTourController.getTours();
}
