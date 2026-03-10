
import axios from 'axios';
import { prisma } from '../../src/lib/prisma';

// RevenueCat Secret Key (Should be in .env)
const REVENUECAT_SECRET = process.env.REVENUECAT_SECRET_KEY;

export const paymentService = {
    async verifyPurchase(userId: number, appUserId: string, platform: 'ios' | 'android' = 'ios') {
        if (!REVENUECAT_SECRET) {
            console.warn("REVENUECAT_SECRET_KEY is not set. Skipping verification (dev mode).");
            // In dev mode without keys, you might want to return success or error
            // For now, let's assume we can't verify so we shouldn't grant tokens unless we trust client (which we don't)
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
            // RevenueCat returns `non_subscriptions` as a map of productId -> array of transactions
            const nonSubscriptions = subscriber.non_subscriptions || {};

            let totalNewTokens = 0;
            const newTransactions: { txId: string; amount: number }[] = [];

            // Iterate over all products
            for (const [productId, transactions] of Object.entries(nonSubscriptions)) {
                // @ts-ignore
                const txs = transactions as any[];
                for (const tx of txs) {
                    // Check if we have already processed this transaction
                    const existingTx = await prisma.purchase.findUnique({
                        where: { transactionId: tx.id }
                    });

                    if (!existingTx) {
                        let amount = 0;

                        // Explicit matching to prevent regex bugs (e.g. grabbing numbers from bundle IDs)
                        if (productId.includes('tokens_10_') || productId.endsWith('tokens_10') || productId.includes('10_tokens')) amount = 10;
                        else if (productId.includes('tokens_5_') || productId.endsWith('tokens_5') || productId.includes('5_tokens')) amount = 5;
                        else if (productId.includes('tokens_2_') || productId.endsWith('tokens_2') || productId.includes('2_tokens')) amount = 2;
                        else if (productId.includes('tokens_1_') || productId.endsWith('tokens_1') || productId.includes('1_token')) amount = 1;
                        else {
                            const match = productId.match(/(\d+)/); // Fallback
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
                                transactionId: tx.id,
                                tokens: amount,
                                productId,
                                // provider is not in schema, ignoring
                            }
                        });

                        totalNewTokens += amount;
                        newTransactions.push({ txId: tx.id, amount });
                    }
                }
            }

            // 3. Grant tokens to user
            if (totalNewTokens > 0) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { tokens: { increment: totalNewTokens } }
                });
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
    }
};
