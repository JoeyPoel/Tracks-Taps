import { savedTripsController } from '@/backend/controllers/savedTripsController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function GET(req: Request, { id }: { id: string }) {
    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.getSavedTrip(req, { id });
}

export async function DELETE(req: Request, { id }: { id: string }) {
    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.deleteSavedTrip(req, { userId: dbUser.id, id });
}

export async function PATCH(req: Request, { id }: { id: string }) {
    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.updateSavedTrip(req, { userId: dbUser.id, id });
}
