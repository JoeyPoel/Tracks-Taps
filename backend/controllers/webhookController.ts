import { paymentService } from '../services/paymentService';

export const webhookController = {
    async handleRevenueCat(request: Request) {
        try {
            const body = await request.json();
            const { event } = body;

            console.log(`[RevenueCat Webhook] Received event: ${event.type}`);

            // We only care about consumable (token) purchases
            if (event.type === 'NON_RENEWING_PURCHASE') {
                const appUserId = event.app_user_id;
                const productId = event.product_id;
                const transactionId = event.store_transaction_id || event.transaction_id;

                if (!appUserId || !productId || !transactionId) {
                    console.error('[RevenueCat Webhook] Missing required fields', { appUserId, productId, transactionId });
                    return Response.json({ error: 'Missing fields' }, { status: 400 });
                }

                // appUserId for us is the numeric userId (sent via Purchases.logIn or configure)
                // If it's a string, we need to parse it
                const userId = parseInt(appUserId, 10);
                if (isNaN(userId)) {
                    console.error('[RevenueCat Webhook] Invalid appUserId (not a number):', appUserId);
                    return Response.json({ error: 'Invalid user ID' }, { status: 400 });
                }

                console.log(`[RevenueCat Webhook] Processing purchase for user:${userId}, product:${productId}, tx:${transactionId}`);

                await paymentService.processPurchaseTransaction(userId, productId, transactionId);
            }

            // Always return 200 to acknowledge receipt to RevenueCat
            return Response.json({ success: true });
        } catch (error: any) {
            console.error('[RevenueCat Webhook] Error:', error.message);
            // Return 200 even on error unless we want RC to retry
            // If it's a parsing error, retrying won't help. 
            // If it's a DB error, we MIGHT want a retry (status 500).
            return Response.json({ error: error.message }, { status: 500 });
        }
    }
};
