import { savedTripsController } from '@/backend/controllers/savedTripsController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function POST(req: Request, { params }: { params: { id: string, tourId: string } }) {
    const { id, tourId } = params;
    console.log(`[API] POST /saved-trips/${id}/tours/${tourId} request received`);
    const user = await verifyAuth(req);
    if (!user || !user.email) {
        console.log('[API] POST addTour Unauthorized: No user or email');
        return new Response('Unauthorized', { status: 401 });
    }

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) {
        console.log('[API] POST addTour Unauthorized: No dbUser found');
        return new Response('Unauthorized', { status: 401 });
    }

    console.log(`[API] POST addTour Authorized. Adding tour ${tourId} to list ${id} for userId: ${dbUser.id}`);
    return savedTripsController.addTour(req, { userId: dbUser.id, id, tourId });
}

export async function DELETE(req: Request, { params }: { params: { id: string, tourId: string } }) {
    const { id, tourId } = params;
    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.removeTour(req, { userId: dbUser.id, id, tourId });
}
