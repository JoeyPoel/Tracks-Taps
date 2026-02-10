import { activeTourController } from '@/backend/controllers/activeTourController';

export async function GET(request: Request, params: { id: string }) {
    return activeTourController.getActiveTourLobby(request, params);
}
