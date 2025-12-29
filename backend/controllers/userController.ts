import { userService } from '../services/userService';

export const userController = {
    async getUser(request: Request) {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const userId = searchParams.get('userId');

        try {
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
        } catch (error) {
            console.error('Error fetching user:', error);
            return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
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
            const { userId, amount } = body;

            if (!userId || !amount) {
                return Response.json({ error: 'Missing userId or amount' }, { status: 400 });
            }

            const updatedUser = await userService.addTokens(Number(userId), Number(amount));
            return Response.json(updatedUser);
        } catch (error) {
            console.error('Error adding tokens:', error);
            return Response.json({ error: 'Failed to add tokens' }, { status: 500 });
        }
    },

    async createUser(request: Request, parsedBody?: any) {
        try {
            const body = parsedBody || await request.json();
            const { email, password } = body;

            if (!email) {
                return Response.json({ error: 'Missing email' }, { status: 400 });
            }

            if (email.length > 254) return Response.json({ error: 'Email exceeds 254 characters' }, { status: 400 });
            if (password && password.length > 100) return Response.json({ error: 'Password exceeds 100 characters' }, { status: 400 });

            // Check if exists first to avoid duplicate errors
            const existing = await userService.getUserByEmail(email);
            if (existing) {
                return Response.json(existing);
            }

            const newUser = await userService.createUserByEmail(email, password);
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

            if (name && name.length > 50) return Response.json({ error: 'Name exceeds 50 characters' }, { status: 400 });

            const updatedUser = await userService.updateUser(Number(userId), { name, avatarUrl });
            return Response.json(updatedUser);
        } catch (error) {
            console.error('Error updating user:', error);
            return Response.json({ error: 'Failed to update user' }, { status: 500 });
        }
    }
};
