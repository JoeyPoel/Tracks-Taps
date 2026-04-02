import { supabaseAdminRole, verifyAuth } from '@/backend/utils/auth';
import { friendService } from '../services/friendService';
import { userService } from '../services/userService';
import { paymentService } from '../services/paymentService';

export const userController = {
    async getUser(request: Request) {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const name = searchParams.get('name');
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
            } else if (userId && type === 'reviews') {
                if (isNaN(parsedUserId)) {
                    console.error('[userController] Invalid userId requested (reviews):', userId);
                    return Response.json({ error: 'Invalid userId' }, { status: 400 });
                }
                const reviews = await userService.getUserReviews(parsedUserId, page, limit);
                return Response.json(reviews);
            }

            let user;
            if (userId && !isNaN(parsedUserId)) {
                user = await userService.getUserProfile(parsedUserId);
            } else if (name) {
                user = await userService.getUserByName(name);
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
                    try {
                        // We might not have an email (Apple Sign-in), fallback to authId proxy
                        const creationEmail = email || `${authId}@apple-hidden.tracksandtaps.com`;
                        user = await userService.createUserByAuthId(authId, creationEmail);
                        (user as any).isNewUser = true;
                    } catch (e: any) {
                        if (e.code === 'P2002') {
                            // Caught race condition, user was just created by another request
                            user = await userService.getUserByAuthId(authId);
                        } else {
                            throw e;
                        }
                    }
                }
            } else if (email) {
                user = await userService.getUserByEmail(email);

                if (!user) {
                    try {
                        user = await userService.createUserByEmail(email);
                        (user as any).isNewUser = true;
                    } catch (e: any) {
                        if (e.code === 'P2002') {
                            user = await userService.getUserByEmail(email);
                        } else {
                            throw e;
                        }
                    }
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

            if (!transactionId) {
                return Response.json({ error: 'Transaction verification required' }, { status: 400 });
            }

            // 1. Determine appUserId (RevenueCat might expect this as a string)
            const appUserId = userId.toString();

            // 2. Use paymentService for verification and award
            const result = await paymentService.verifyPurchase(Number(userId), appUserId, 'ios', transactionId);

            if (!result.success) {
                return Response.json({ error: 'Verification failed' }, { status: 400 });
            }

            return Response.json(result);
        } catch (error: any) {
            console.error('Error adding tokens:', error);
            return Response.json({ error: 'Failed to add tokens', details: error.message }, { status: 500 });
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
            let newUser;
            try {
                newUser = await userService.createUserByAuthId(authId || '', email || `${authId}@apple-hidden.tracksandtaps.com`);
            } catch (e: any) {
                if (e.code === 'P2002') {
                    if (authId) newUser = await userService.getUserByAuthId(authId);
                    else if (email) newUser = await userService.getUserByEmail(email);
                } else {
                    throw e;
                }
            }
            if (newUser) (newUser as any).isNewUser = true;
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
        } catch (error: any) {
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
