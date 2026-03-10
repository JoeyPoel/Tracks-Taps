import { webhookController } from '@/backend/controllers/webhookController';

export async function POST(request: Request) {
    return webhookController.handleRevenueCat(request);
}
