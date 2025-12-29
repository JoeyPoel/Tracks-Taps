import { savedTripsController } from '@/backend/controllers/savedTripsController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(req: Request) {
    console.log('[API] GET /saved-trips request received');
    const user = await verifyAuth(req);
    if (!user || !user.email) {
        console.log('[API] GET /saved-trips Unauthorized: No user or email', user);
        return new Response('Unauthorized', { status: 401 });
    }

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) {
        console.log('[API] GET /saved-trips Unauthorized: No dbUser found for email', user.email);
        return new Response('Unauthorized', { status: 401 });
    }

    console.log('[API] GET /saved-trips Authorized. Fetching for userId:', dbUser.id);
    return savedTripsController.getUserSavedTrips(req, { userId: dbUser.id });
}

export async function POST(req: Request) {
    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.createSavedTrip(req, { userId: dbUser.id });
}
