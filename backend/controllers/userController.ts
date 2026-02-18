import { userService } from '../services/userService';

export const userController = {
    async getUser(request: Request) {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const userId = searchParams.get('userId');
        const type = searchParams.get('type');
        const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
        const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

        try {
            if (userId && type === 'played') {
                const tours = await userService.getUserPlayedTours(parseInt(userId), page, limit);
                return Response.json(tours);
            } else if (userId && type === 'created') {
                const tours = await userService.getUserCreatedTours(parseInt(userId), page, limit);
                return Response.json(tours);
            }

            let user;
            if (userId) {
                user = await userService.getUserProfile(parseInt(userId));
            } else if (email) {
                user = await userService.getUserByEmail(email);

                // If user doesn't exist in our DB but is authenticated (we assume this based on the flow),
                // create or return a default user structure so the app doesn't crash.
                // In a real app, you would sync this with Supabase webhooks or explicit creation.
                if (!user) {
                    user = await userService.createUserByEmail(email);
                }
            } else {
                return Response.json({ error: 'Missing userId or email' }, { status: 400 });
            }

            if (!user) {
                return Response.json({ error: 'User not found' }, { status: 404 });
            }

            return Response.json(user);
        } catch (error: any) {
            console.error('Error fetching user:', error);
            return Response.json({
                error: 'Failed to fetch user',
                details: error.message,
                stack: error instanceof Error ? error.stack : undefined
            }, { status: 500 });
        }
    },

    async addXp(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { userId, amount } = body;

            if (!userId || !amount) {
                return Response.json({ error: 'Missing userId or amount' }, { status: 400 });
            }

            const updatedUser = await userService.addXp(Number(userId), Number(amount));
            return Response.json(updatedUser);
        } catch (error) {
            console.error('Error adding XP:', error);
            return Response.json({ error: 'Failed to add XP' }, { status: 500 });
        }
    },

    async addTokens(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { userId, amount, transactionId } = body;

            // INTERNAL/DEBUG BYPASS: Allow manual add if explicitly requested by a trusted source (or if amount is small/from referral?). 
            // For now, if no transactionId is provided, we BLOCK it to ensure security for purchases.
            // Referrals use 'userRepository.addTokens' directly in 'claimReferral' so they are not affected by this controller lock-down 
            // UNLESS the 'claimReferral' controller calls this? No, it calls 'userService.claimReferral'.

            if (!transactionId) {
                // If this is for testing, you might want to uncomment this, but for "totally secure", we reject.
                return Response.json({ error: 'Transaction verification required' }, { status: 400 });
            }

            // 1. Idempotency Check
            const existingPurchase = await userService.getPurchase(transactionId);
            if (existingPurchase) {
                return Response.json({ error: 'Transaction already processed' }, { status: 409 });
            }

            // 2. RevenueCat Verification
            const RC_SECRET = process.env.REVENUECAT_SECRET_KEY;

            // Allow bypassing verification ONLY if secret key is missing (Dev Mode) AND it's explicitly handled, 
            // but for "secure" request we must fail if no key.
            if (!RC_SECRET) {
                console.error('REVENUECAT_SECRET_KEY not set');
                return Response.json({ error: 'Server configuration error: REVENUECAT_SECRET_KEY missing' }, { status: 500 });
            }

            const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${RC_SECRET}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('RevenueCat API Error', await response.text());
                return Response.json({ error: 'Failed to verify transaction with provider' }, { status: 502 });
            }

            const data = await response.json();
            const subscriber = data.subscriber;

            let transactionFound = false;
            let verifiedProductId = '';

            // Search in non_subscriptions for the transaction string
            if (subscriber.non_subscriptions) {
                Object.keys(subscriber.non_subscriptions).forEach(pid => {
                    const transactions = subscriber.non_subscriptions[pid];
                    const match = transactions.find((t: any) => t.id === transactionId || t.original_transaction_id === transactionId);
                    if (match) {
                        transactionFound = true;
                        verifiedProductId = pid;
                    }
                });
            }

            if (!transactionFound) {
                return Response.json({ error: 'Transaction not found in RevenueCat history' }, { status: 400 });
            }

            // 3. Determine Tokens (Server-side Source of Truth)
            let tokensToAward = 0;
            // Flexible matching for product IDs like 'tokens_10_consumable' or just 'tokens_10'
            if (verifiedProductId.includes('tokens_10')) tokensToAward = 10;
            else if (verifiedProductId.includes('tokens_5')) tokensToAward = 5;
            else if (verifiedProductId.includes('tokens_2')) tokensToAward = 2;
            else if (verifiedProductId.includes('tokens_1')) tokensToAward = 1;
            else {
                return Response.json({ error: `Unknown product identifier: ${verifiedProductId}` }, { status: 400 });
            }

            const purchase = await userService.createPurchase(Number(userId), {
                transactionId,
                productId: verifiedProductId,
                tokens: tokensToAward
            });

            return Response.json(purchase);
        } catch (error) {
            console.error('Error adding tokens:', error);
            return Response.json({ error: 'Failed to add tokens' }, { status: 500 });
        }
    },

    async createUser(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { email } = body;

            if (!email) {
                return Response.json({ error: 'Missing email' }, { status: 400 });
            }

            if (email.length > 254) return Response.json({ error: 'Email exceeds 254 characters' }, { status: 400 });

            // Check if exists first to avoid duplicate errors
            const existing = await userService.getUserByEmail(email);
            if (existing) {
                return Response.json(existing);
            }

            const newUser = await userService.createUserByEmail(email);
            return Response.json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            return Response.json({ error: 'Failed to create user' }, { status: 500 });
        }
    },

    async updateUser(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { userId, name, avatarUrl } = body;

            if (!userId) {
                return Response.json({ error: 'Missing userId' }, { status: 400 });
            }

            if (name && name.length > 25) return Response.json({ error: 'Name exceeds 25 characters' }, { status: 400 });

            const updatedUser = await userService.updateUser(Number(userId), { name, avatarUrl });
            return Response.json(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            return Response.json({ error: 'Failed to update user' }, { status: 500 });
        }
    },

    async claimReferral(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { userId, code } = body;

            if (!userId || !code) {
                return Response.json({ error: 'Missing userId or code' }, { status: 400 });
            }

            const result = await userService.claimReferral(Number(userId), code);
            return Response.json(result);
        } catch (error: any) {
            console.error('Error claiming referral:', error);
            return Response.json({ error: error.message || 'Failed to claim referral' }, { status: 400 });
        }
    }
};
