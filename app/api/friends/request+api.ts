import { friendController } from '@/backend/controllers/friendController';

export async function GET(request: Request) {
    return await friendController.getRequests(request);
}

export async function POST(request: Request) {
    return await friendController.sendRequest(request);
}
