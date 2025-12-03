import { activeTourService } from '../services/activeTourService';

export const activeTourController = {
    async startTour(request: Request) {
        try {
            const body = await request.json();
            const { userId, tourId, force } = body;

            if (!userId || !tourId) {
                return Response.json({ error: 'Missing userId or tourId' }, { status: 400 });
            }

            const newActiveTour = await activeTourService.startTourWithConflictCheck(tourId, userId, force);
            return Response.json(newActiveTour);

        } catch (error: any) {
            if (error.conflict) {
                return Response.json({
                    error: error.message,
                    activeTour: error.conflict
                }, { status: 409 });
            }

            console.error('Error starting tour:', error);
            return Response.json({ error: 'Failed to start tour' }, { status: 500 });
        }
    },
    
    async getActiveTours(request: Request) {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return Response.json({ error: 'Missing userId' }, { status: 400 });
        }

        try {
            const activeTours = await activeTourService.getActiveToursForUser(parseInt(userId));
            return Response.json(activeTours);
        } catch (error) {
            console.error('Error fetching active tours:', error);
            return Response.json({ error: 'Failed to fetch active tours' }, { status: 500 });
        }
    },

    async getActiveTourById(request: Request, params: { id: string }) {
        const { id } = params;
        if (!id) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const activeTourId = Number(id);
        if (isNaN(activeTourId)) {
            return Response.json({ error: 'Invalid activeTourId' }, { status: 400 });
        }

        try {
            const activeTour = await activeTourService.getActiveTourById(activeTourId);
            if (!activeTour) {
                return Response.json({ error: 'Active tour not found' }, { status: 404 });
            }
            return Response.json(activeTour);
        } catch (error) {
            console.error('Error fetching active tour details:', error);
            return Response.json({ error: 'Failed to fetch active tour details' }, { status: 500 });
        }
    },

    async completeChallenge(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, challengeId, userId } = body;

            const result = await activeTourService.completeChallenge(Number(activeTourId), Number(challengeId), Number(userId));
            return Response.json(result);
        } catch (error) {
            console.error('Error completing challenge:', error);
            return Response.json({ error: 'Failed to complete challenge' }, { status: 500 });
        }
    },

    async failChallenge(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, challengeId } = body;

            const result = await activeTourService.failChallenge(Number(activeTourId), Number(challengeId));
            return Response.json(result);
        } catch (error) {
            console.error('Error failing challenge:', error);
            return Response.json({ error: 'Failed to update challenge status' }, { status: 500 });
        }
    },

    async abandonTour(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId } = body;

            const updatedTour = await activeTourService.abandonTour(activeTourId);
            return Response.json(updatedTour);
        } catch (error) {
            console.error('Error abandoning tour:', error);
            return Response.json({ error: 'Failed to abandon tour' }, { status: 500 });
        }
    },

    async finishTour(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId } = body;

            const updatedTour = await activeTourService.finishTour(activeTourId);
            return Response.json(updatedTour);
        } catch (error) {
            console.error('Error finishing tour:', error);
            return Response.json({ error: 'Failed to finish tour' }, { status: 500 });
        }
    }
};
