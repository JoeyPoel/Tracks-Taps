import { activeTourController } from '../../../backend-mock/controllers/activeTourController';

export async function GET(request: Request, params: { id: string }) {
    return await activeTourController.getActiveTourById(request, params);
}
