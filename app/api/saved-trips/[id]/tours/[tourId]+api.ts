import { savedTripsController } from '@/backend/controllers/savedTripsController';
import { userService } from '@/backend/services/userService';
import { verifyAuth } from '@/backend/utils/auth';

export async function POST(req: Request, props: any) {
    const params = props?.params || {};
    let { id, tourId } = params;

    // Fallback if params are missing (common in some Expo Router contexts)
    if (!id || !tourId) {
        try {
            const url = new URL(req.url);
            const segments = url.pathname.split('/');
            // Expected: .../saved-trips/[id]/tours/[tourId]
            // segments: [..., 'saved-trips', '123', 'tours', '456']
            if (segments.length >= 4) {
                tourId = segments[segments.length - 1];
                id = segments[segments.length - 3];
            }
        } catch (e) {
            console.error('[API] Failed to parse params from URL', e);
        }
    }

    if (!id || !tourId) {
        return new Response('Missing id or tourId', { status: 400 });
    }

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

export async function DELETE(req: Request, props: any) {
    const params = props?.params || {};
    let { id, tourId } = params;

    if (!id || !tourId) {
        try {
            const url = new URL(req.url);
            const segments = url.pathname.split('/');
            if (segments.length >= 4) {
                tourId = segments[segments.length - 1];
                id = segments[segments.length - 3];
            }
        } catch (e) {
            console.error('[API] Failed to parse params from URL', e);
        }
    }

    if (!id || !tourId) {
        return new Response('Missing id or tourId', { status: 400 });
    }

    const user = await verifyAuth(req);
    if (!user || !user.email) return new Response('Unauthorized', { status: 401 });

    const dbUser = await userService.getUserByEmail(user.email);
    if (!dbUser) return new Response('Unauthorized', { status: 401 });

    return savedTripsController.removeTour(req, { userId: dbUser.id, id, tourId });
}
