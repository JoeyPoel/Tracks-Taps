import { userController } from '../../backend-mock/controllers/userController';
import { userService } from '../../backend-mock/services/userService';
import { verifyAuth } from './_utils';

export async function GET(request: Request) {
    const user = await verifyAuth(request);
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return await userController.getUser(request);
}

export async function POST(request: Request) {
    const user = await verifyAuth(request);

    if (!user || !user.email) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        if (body.action === 'buy-tokens' || body.action === 'add-xp') {
            // Security check: Ensure the userId in the body belongs to the authenticated user
            const dbUser = await userService.getUserByEmail(user.email);

            if (!dbUser || dbUser.id !== Number(body.userId)) {
                return Response.json({ error: 'Forbidden: You can only modify your own account.' }, { status: 403 });
            }

            if (body.action === 'buy-tokens') {
                return await userController.addTokens(request, body);
            } else {
                return await userController.addXp(request, body);
            }
        } else if (body.action === 'create-user') {
            // Ensure the authenticated user matches the email being created
            if (user.email !== body.email) {
                return Response.json({ error: 'Forbidden' }, { status: 403 });
            }
            return await userController.createUser(request, body);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in user POST:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
