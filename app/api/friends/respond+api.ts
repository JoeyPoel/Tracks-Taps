import { friendController } from '@/backend/controllers/friendController';

export async function POST(request: Request) {
    return await friendController.respondToRequest(request);
}
