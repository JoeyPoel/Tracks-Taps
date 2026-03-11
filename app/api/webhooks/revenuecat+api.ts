import { webhookController } from '@/backend/controllers/webhookController';

export async function POST(request: Request) {
    // 1. Authorization Check
    const expectedAuth = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

    // Only enforce if the environment variable is set, allowing fallback during dev setup if needed
    if (expectedAuth) {
        const authHeader = request.headers.get('Authorization');
        // RevenueCat sends exactly "Bearer <token>" or just the token depending on how it's typed
        // Let's check if the header includes our expected key
        if (!authHeader || !authHeader.includes(expectedAuth)) {
            console.error('[Webhook] Unauthorized access attempt.');
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
    } else {
        console.warn('[Webhook] REVENUECAT_WEBHOOK_AUTH_KEY is not set in environment variables. Webhook is unprotected.');
    }

    return webhookController.handleRevenueCat(request);
}
