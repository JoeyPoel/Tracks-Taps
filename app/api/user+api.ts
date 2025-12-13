import { userController } from '../../backend-mock/controllers/userController';

export async function GET(request: Request) {
    return await userController.getUser(request);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === 'buy-tokens') {
            return await userController.addTokens(request, body);
        } else if (body.action === 'add-xp') {
            return await userController.addXp(request, body);
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in user POST:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
