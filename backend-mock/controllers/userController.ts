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

    async addXp(request: Request) {
        try {
            const body = await request.json();
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
    }
};
