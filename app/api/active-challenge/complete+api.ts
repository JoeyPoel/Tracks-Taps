import { activeTourController } from '../../../backend-mock/controllers/activeTourController';

export async function POST(request: Request) {
    return await activeTourController.completeChallenge(request);
}
