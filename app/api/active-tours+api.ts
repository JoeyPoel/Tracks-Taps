import { activeTourController } from '../../backend-mock/controllers/activeTourController';

export async function GET(request: Request) {
    return await activeTourController.getActiveTours(request);
}

export async function POST(request: Request) {
    return await activeTourController.startTour(request);
}
