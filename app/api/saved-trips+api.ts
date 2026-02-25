import { savedTripsController } from '@/backend/controllers/savedTripsController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(req: Request) {
    const user = await verifyAuth(req);
    if (!user || !user.email) {
        return new Response('Unauthorized', { status: 401 });
    }

    const dbUser = await userService.getUserIdByEmail(user.email);
    if (!dbUser) {
        return new Response('Unauthorized', { status: 401 });
    }

    return savedTripsController.getUserSavedTrips(req, { userId: dbUser.id });
}

export async function POST(req: Request) {
    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    const dbUser = await userService.getUserIdByEmail(user.email);
    if (!dbUser) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.createSavedTrip(req, { userId: dbUser.id });
}
