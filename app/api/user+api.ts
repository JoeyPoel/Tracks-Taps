import { userService } from '../../src/services/userService';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');

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
}
