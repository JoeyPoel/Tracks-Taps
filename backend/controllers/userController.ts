import { supabaseAdminRole, verifyAuth } from '@/backend/utils/auth';
import { friendService } from '../services/friendService';
import { userService } from '../services/userService';

export const userController = {
    async getUser(request: Request) {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const username = searchParams.get('username');
        const userId = searchParams.get('userId');
        const authId = searchParams.get('authId');
        const query = searchParams.get('query');
        const type = searchParams.get('type');
        const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
        const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

        try {
            if (query) {
                const users = await userService.searchUsers(query, limit, page);

                // If authenticated, check friendship status for each user
                try {
                    const requester = await verifyAuth(request);
                    if (requester && requester.email) {
                        const usersWithStatus = await Promise.all(users.map(async (u: any) => {
                            const friendship = await friendService.checkFriendshipStatus(requester.email!, u.id);
                            return { ...u, friendshipStatus: friendship };
                        }));
                        return Response.json(usersWithStatus);
                    }
                } catch (e) {
                    // Not authenticated, just return users
                }

                return Response.json(users);
            }

            const parsedUserId = userId ? parseInt(userId, 10) : NaN;

            if (userId && type === 'played') {
                if (isNaN(parsedUserId)) {
                    console.error('[userController] Invalid userId requested:', userId);
                    return Response.json({ error: 'Invalid userId' }, { status: 400 });
                }
                const tours = await userService.getUserPlayedTours(parsedUserId, page, limit);
                return Response.json(tours);
            } else if (userId && type === 'created') {
                if (isNaN(parsedUserId)) {
                    console.error('[userController] Invalid userId requested (created):', userId);
                    return Response.json({ error: 'Invalid userId' }, { status: 400 });
                }
                const tours = await userService.getUserCreatedTours(parsedUserId, page, limit);
                return Response.json(tours);
            }

            let user;
            if (userId && !isNaN(parsedUserId)) {
                user = await userService.getUserProfile(parsedUserId);
            } else if (username) {
                user = await userService.getUserByUsername(username);
            } else if (authId) {
                user = await userService.getUserByAuthId(authId);

                // If user doesn't exist by authId but we have an email, fallback to email lookup (legacy linkage)
                if (!user && email) {
                    user = await userService.getUserByEmail(email);
                    if (user && !user.authId) {
                        // Link existing user to this authId
                        user = await userService.updateUserAuthId(user.id, authId);
                    }
                }

                // Auto-create user if they don't exist in our DB but authenticated successfully
                if (!user) {
                    // We might not have an email (Apple Sign-in), fallback to authId proxy
                    const creationEmail = email || `${authId}@apple-hidden.tracksandtaps.com`;
                    user = await userService.createUserByAuthId(authId, creationEmail);
                    (user as any).isNewUser = true;
                }
            } else if (email) {
                user = await userService.getUserByEmail(email);

                if (!user) {
                    user = await userService.createUserByEmail(email);
                    (user as any).isNewUser = true;
                }
            } else {
                return Response.json({ error: 'Missing userId, authId, or email' }, { status: 400 });
            }

            if (!user) {
                return Response.json({ error: 'User not found' }, { status: 404 });
            }
            // Check friendship status relative to current user
            try {
                const requester = await verifyAuth(request);
                if (requester && requester.email && user.id !== (requester as any).userId) {
                    const friendship = await friendService.checkFriendshipStatus(requester.email, user.id);
                    (user as any).friendshipStatus = friendship;
                }
            } catch (e) {
                // Not authenticated or error, ignore
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
            const { email, authId } = body;

            if (!email && !authId) {
                return Response.json({ error: 'Missing email or authId' }, { status: 400 });
            }

            if (email && email.length > 254) return Response.json({ error: 'Email exceeds 254 characters' }, { status: 400 });

            // Check if exists first
            let existing = null;
            if (authId) {
                existing = await userService.getUserByAuthId(authId);
            }
            if (!existing && email) {
                existing = await userService.getUserByEmail(email);
            }
            if (existing) {
                return Response.json(existing);
            }

            // Create using authId safely
            const newUser = await userService.createUserByAuthId(authId || '', email || `${authId}@apple-hidden.tracksandtaps.com`);
            (newUser as any).isNewUser = true;
            return Response.json(newUser);
        } catch (error) {
            console.error('Error creating user:', error);
            return Response.json({ error: 'Failed to create user' }, { status: 500 });
        }
    },

    async updateUser(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { userId, name, avatarUrl, username } = body;

            if (!userId) {
                return Response.json({ error: 'Missing userId' }, { status: 400 });
            }

            if (name && name.length > 25) return Response.json({ error: 'Name exceeds 25 characters' }, { status: 400 });
            if (username && (username.length < 3 || username.length > 20)) return Response.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });

            const updatedUser = await userService.updateUser(Number(userId), { name, avatarUrl, username });
            return Response.json(updatedUser);
        } catch (error: any) {
            console.error('Error updating user:', error);
            if (error.message.includes('Unique constraint failed on the fields: (`username`)')) {
                return Response.json({ error: 'Username already taken' }, { status: 400 });
            }
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
    },

    async deleteUser(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { userId } = body;

            if (!userId) {
                return Response.json({ error: 'Missing userId' }, { status: 400 });
            }

            const deletedUser = await userService.deleteUser(Number(userId));

            if (deletedUser && deletedUser.authId) {
                if (supabaseAdminRole) {
                    const { error } = await supabaseAdminRole.auth.admin.deleteUser(deletedUser.authId);
                    if (error) {
                        console.error('Failed to delete user from Supabase Auth:', error);
                    } else {
                        console.log(`Successfully deleted user ${deletedUser.authId} from Supabase Auth`);
                    }
                } else {
                    console.warn('SUPABASE_SERVICE_ROLE_KEY missing. User not deleted from Supabase Auth.');
                }
            }

            return Response.json({ success: true, message: 'User deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting user:', error);
            return Response.json({ error: 'Failed to delete user' }, { status: 500 });
        }
    }
};
