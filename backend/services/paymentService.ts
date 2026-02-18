
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
                        'Authorization': `Bearer ${REVENUECAT_SECRET}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            const subscriber = response.data.subscriber;
            
            // 2. Look for non-subscription transactions (Consumables)
            // RevenueCat returns `non_subscriptions` as a map of productId -> array of transactions
            const nonSubscriptions = subscriber.non_subscriptions;
            
            let totalNewTokens = 0;
            const newTransactions: { txId: string; amount: number }[] = [];

            // Iterate over all products
            for (const [productId, transactions] of Object.entries(nonSubscriptions)) {
                // @ts-ignore
                const txs = transactions as any[];
                for (const tx of txs) {
                    // Check if we have already processed this transaction
                    const existingTx = await prisma.transaction.findUnique({
                        where: { txId: tx.id }
                    });

                    if (!existingTx) {
                        // Determine token amount based on product ID
                        // Format example: "com.joeypoel.trackstaps.tokens_100"
                        let amount = 0;
                        const match = productId.match(/(\d+)/); // Extract number
                        if (match) {
                            amount = parseInt(match[0], 10);
                        } else {
                            // Config-based fallback map
                            if (productId.includes('small')) amount = 100;
                            else if (productId.includes('medium')) amount = 500;
                            else if (productId.includes('large')) amount = 1200;
                            else amount = 100; // Default
                        }

                        // Record transaction
                        await prisma.transaction.create({
                            data: {
                                userId,
                                txId: tx.id,
                                amount,
                                productId,
                                provider: tx.store, // 'app_store', 'play_store'
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
