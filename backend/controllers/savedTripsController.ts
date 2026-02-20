import { savedTripsService } from '../services/savedTripsService';

export const savedTripsController = {
    async getUserSavedTrips(req: Request, { userId }: { userId: number }) {
        try {
            const { searchParams } = new URL(req.url);
            const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
            const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

            const lists = await savedTripsService.getUserSavedTrips(userId, page, limit);
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

    async getSavedTrip(req: Request, params?: { id: string }) {
        try {
            let id = params?.id;
            if (!id) {
                const url = new URL(req.url);
                const segments = url.pathname.split('/');
                id = segments[segments.length - 1];
            }
            if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

            const list = await savedTripsService.getSavedTrip(parseInt(id));
            if (!list) return Response.json({ error: 'Saved trip list not found' }, { status: 404 });
            return Response.json(list);
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async deleteSavedTrip(req: Request, params: { userId: number, id?: string }) {
        try {
            let id = params?.id;
            if (!id) {
                const url = new URL(req.url);
                const segments = url.pathname.split('/');
                id = segments[segments.length - 1];
            }
            if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

            await savedTripsService.deleteSavedTrip(parseInt(id), params.userId);
            return Response.json({ success: true });
        } catch (error: any) {
            const status = error.message === 'Unauthorized' ? 403 : 500;
            return Response.json({ error: error.message }, { status });
        }
    },

    async updateSavedTrip(req: Request, params: { userId: number, id?: string }) {
        try {
            let id = params?.id;
            if (!id) {
                const url = new URL(req.url);
                const segments = url.pathname.split('/');
                id = segments[segments.length - 1];
            }
            if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });

            const body = await req.json();

            if (body.tourIds && Array.isArray(body.tourIds)) {
                const list = await savedTripsService.updateTourOrder(parseInt(id), params.userId, body.tourIds);
                return Response.json(list);
            }

            if (body.name) {
                const list = await savedTripsService.updateSavedTripName(parseInt(id), params.userId, body.name);
                return Response.json(list);
            }

            return Response.json({ error: 'Nothing to update' }, { status: 400 });
        } catch (error: any) {
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async addTour(req: Request, params: { userId: number, id?: string, tourId?: string }) {
        try {
            let id = params?.id;
            let tourId = params?.tourId;

            if (!id || !tourId) {
                const url = new URL(req.url);
                const segments = url.pathname.split('/');
                if (!tourId) tourId = segments[segments.length - 1];
                if (!id) id = segments[segments.length - 3] === 'tour' ? segments[segments.length - 2] : segments[segments.length - 3] || segments[segments.length - 2];
            }

            const listId = parseInt(id || '');
            const tId = parseInt(tourId || '');

            if (isNaN(listId) || isNaN(tId)) {
                return Response.json({ error: 'Invalid ID format' }, { status: 400 });
            }

            const list = await savedTripsService.addTourToSavedTrip(listId, params.userId, tId);
            return Response.json(list);
        } catch (error: any) {
            if (error.code === 'P2025' || error.message?.includes('not found')) {
                return Response.json({ error: 'Saved trip list or tour not found' }, { status: 404 });
            }
            if (error.message?.includes('Unauthorized')) {
                return Response.json({ error: 'Unauthorized' }, { status: 403 });
            }
            console.error('AddTour Error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    },

    async removeTour(req: Request, params: { userId: number, id?: string, tourId?: string }) {
        try {
            let id = params?.id;
            let tourId = params?.tourId;

            if (!id || !tourId) {
                const url = new URL(req.url);
                const segments = url.pathname.split('/');
                if (!tourId) tourId = segments[segments.length - 1];
                if (!id) id = segments[segments.length - 3] === 'tour' ? segments[segments.length - 2] : segments[segments.length - 3] || segments[segments.length - 2];
            }

            const listId = parseInt(id || '');
            const tId = parseInt(tourId || '');

            if (isNaN(listId) || isNaN(tId)) {
                return Response.json({ error: 'Invalid ID format' }, { status: 400 });
            }

            const list = await savedTripsService.removeTourFromSavedTrip(listId, params.userId, tId);
            return Response.json(list);
        } catch (error: any) {
            if (error.code === 'P2025' || error.message?.includes('not found')) {
                return Response.json({ error: 'Saved trip list or tour not found' }, { status: 404 });
            }
            if (error.message?.includes('Unauthorized')) {
                return Response.json({ error: 'Unauthorized' }, { status: 403 });
            }
            console.error('RemoveTour Error:', error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    },


};
