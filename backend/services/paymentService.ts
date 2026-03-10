
import axios from 'axios';
import { prisma } from '../../src/lib/prisma';

// RevenueCat Secret Key (Should be in .env)
const REVENUECAT_SECRET = process.env.REVENUECAT_SECRET_KEY;

export const paymentService = {
    async verifyPurchase(userId: number, appUserId: string, platform: 'ios' | 'android' = 'ios') {
        if (!REVENUECAT_SECRET) {
            console.warn("REVENUECAT_SECRET_KEY is not set. Skipping verification (dev mode).");
            throw new Error("Server configuration error: Missing RevenueCat Key");
        }

        try {
            // 1. Fetch Subscriber Info from RevenueCat
            const response = await axios.get(
                `https://api.revenuecat.com/v1/subscribers/${appUserId}`,
                {
                    headers: {
                        'Authorization': `${REVENUECAT_SECRET}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const subscriber = response.data.subscriber;

            // 2. Look for non-subscription transactions (Consumables)
            const nonSubscriptions = subscriber.non_subscriptions || {};

            let totalNewTokens = 0;
            const newTransactions: { txId: string; amount: number }[] = [];

            // Iterate over all products
            for (const [productId, transactions] of Object.entries(nonSubscriptions)) {
                const txs = transactions as any[];
                for (const tx of txs) {
                    const safeTxId = tx.store_transaction_id || tx.id;

                    const result = await this.processPurchaseTransaction(userId, productId, safeTxId);
                    if (result.isNew) {
                        totalNewTokens += result.amount;
                        newTransactions.push({ txId: safeTxId, amount: result.amount });
                    }
                }
            }

            return {
                success: true,
                newTokens: totalNewTokens,
                processedTransactions: newTransactions.length
            };

        } catch (error: any) {
            console.error("Payment Verification Failed:", error.response?.data || error.message);
            throw new Error("Failed to verify purchase with RevenueCat");
        }
    },

    /**
     * Internal logic to process a specific transaction and grant tokens.
     * Accessible by verification endpoint and webhook.
     */
    async processPurchaseTransaction(userId: number, productId: string, transactionId: string) {
        // Check if we have already processed this transaction
        const existingTx = await prisma.purchase.findUnique({
            where: { transactionId }
        });

        if (existingTx) {
            return { isNew: false, amount: existingTx.tokens };
        }

        let amount = 0;

        // Explicit matching for tokens
        if (productId.includes('tokens_10_') || productId.endsWith('tokens_10') || productId.includes('10_tokens')) amount = 10;
        else if (productId.includes('tokens_5_') || productId.endsWith('tokens_5') || productId.includes('5_tokens')) amount = 5;
        else if (productId.includes('tokens_2_') || productId.endsWith('tokens_2') || productId.includes('2_tokens')) amount = 2;
        else if (productId.includes('tokens_1_') || productId.endsWith('tokens_1') || productId.includes('1_token')) amount = 1;
        else {
            const match = productId.match(/(\d+)/);
            if (match) {
                amount = parseInt(match[0], 10);
            } else {
                amount = 1; // Default
            }
        }

        // Record transaction (Purchase)
        await prisma.purchase.create({
            data: {
                userId,
                transactionId,
                tokens: amount,
                productId,
            }
        });

        // Grant tokens to user
        await prisma.user.update({
            where: { id: userId },
            data: { tokens: { increment: amount } }
        });

        console.log(`[paymentService] Awarded ${amount} tokens to user:${userId} for tx:${transactionId}`);

        return { isNew: true, amount };
    }
};
