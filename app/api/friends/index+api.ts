import { friendController } from '@/backend/controllers/friendController';

export async function GET(request: Request) {
    return await friendController.getFriends(request);
}
