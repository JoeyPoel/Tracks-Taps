import { savedTripsService } from '../services/savedTripsService';

export const savedTripsController = {
    async getUserSavedTrips(req: Request, { userId }: { userId: number }) {
        try {
            const lists = await savedTripsService.getUserSavedTrips(userId);
            return Response.json(lists);
        } catch (error: any) {
            console.error('[SavedTripsController] Error getting user saved trips:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async createSavedTrip(req: Request, { userId }: { userId: number }) {
        try {
            const body = await req.json();
            const { name } = body;
            if (!name) return Response.json({ error: 'Name is required' }, { status: 400 });

            const list = await savedTripsService.createSavedTrip(userId, name);
            return Response.json(list, { status: 201 });
        } catch (error: any) {
            // P2002 is Prisma unique constraint violation
            if (error.code === 'P2002') {
                return Response.json({ error: 'You already have a list with this name' }, { status: 409 });
            }
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async getSavedTrip(req: Request, { id }: { id: string }) {
        try {
            const list = await savedTripsService.getSavedTrip(parseInt(id));
            if (!list) return Response.json({ error: 'Saved trip list not found' }, { status: 404 });
            return Response.json(list);
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async deleteSavedTrip(req: Request, { userId, id }: { userId: number, id: string }) {
        try {
            await savedTripsService.deleteSavedTrip(parseInt(id), userId);
            return Response.json({ success: true });
        } catch (error: any) {
            const status = error.message === 'Unauthorized' ? 403 : 500;
            return Response.json({ error: error.message }, { status });
        }
    },

    async updateSavedTrip(req: Request, { userId, id }: { userId: number, id: string }) {
        try {
            const body = await req.json();
            if (body.name) {
                const list = await savedTripsService.updateSavedTripName(parseInt(id), userId, body.name);
                return Response.json(list);
            }
            return Response.json({ error: 'Nothing to update' }, { status: 400 });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async addTour(req: Request, { userId, id, tourId }: { userId: number, id: string, tourId: string }) {
        try {
            const list = await savedTripsService.addTourToSavedTrip(parseInt(id), userId, parseInt(tourId));
            return Response.json(list);
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async removeTour(req: Request, { userId, id, tourId }: { userId: number, id: string, tourId: string }) {
        try {
            const list = await savedTripsService.removeTourFromSavedTrip(parseInt(id), userId, parseInt(tourId));
            return Response.json(list);
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    }
};
