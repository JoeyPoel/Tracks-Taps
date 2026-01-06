import { activeTourService } from '../services/activeTourService';

export const activeTourController = {
    async startTour(request: Request) {
        try {
            const body = await request.json();
            const { userId, tourId, force, teamName, teamColor, teamEmoji } = body;

            if (!userId || !tourId) {
                return Response.json({ error: 'Missing userId or tourId' }, { status: 400 });
            }

            const newActiveTour = await activeTourService.startTourWithConflictCheck(Number(tourId), Number(userId), force, teamName, teamColor, teamEmoji);
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

    async joinTour(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, userId, teamName, teamColor, teamEmoji } = body;

            if (!userId || !activeTourId) {
                return Response.json({ error: 'Missing userId or activeTourId' }, { status: 400 });
            }

            const team = await activeTourService.joinTour(Number(activeTourId), Number(userId), teamName, teamColor, teamEmoji);
            return Response.json(team);

        } catch (error: any) {
            console.error('Error joining tour:', error);
            return Response.json({ error: error.message || 'Failed to join tour' }, { status: 500 });
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

    async getActiveTourById(request: Request, params?: { id: string }, userId?: number) {
        let id = params?.id;

        if (!id) {
            // Fallback: try to extract from URL
            const url = new URL(request.url);
            const segments = url.pathname.split('/');
            id = segments[segments.length - 1];
        }

        if (!id) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const activeTourId = Number(id);
        if (isNaN(activeTourId)) {
            return Response.json({ error: 'Invalid activeTourId' }, { status: 400 });
        }

        try {
            const activeTour = await activeTourService.getActiveTourById(activeTourId, userId);
            if (!activeTour) {
                return Response.json({ error: 'Active tour not found' }, { status: 404 });
            }
            return Response.json(activeTour);
        } catch (error: any) {
            console.error('Error fetching active tour details:', error);
            return Response.json({ error: 'Failed to fetch active tour details', details: error.message }, { status: 500 });
        }
    },

    async getActiveTourProgress(request: Request, params?: { id: string }) {
        let id = params?.id;

        if (!id) {
            const url = new URL(request.url);
            // URL pattern: /api/active-tour/[id]/progress
            const segments = url.pathname.split('/');
            // segments: ['', 'api', 'active-tour', '123', 'progress']
            id = segments[segments.length - 2];
        }

        if (!id) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const activeTourId = Number(id);
        if (isNaN(activeTourId)) {
            return Response.json({ error: 'Invalid activeTourId' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        try {
            const activeTour = await activeTourService.getActiveTourProgress(activeTourId, userId ? Number(userId) : undefined);
            if (!activeTour) {
                return Response.json({ error: 'Active tour not found' }, { status: 404 });
            }
            return Response.json(activeTour);
        } catch (error: any) {
            console.error('Error fetching active tour progress:', error);
            return Response.json({ error: 'Failed to fetch active tour progress', details: error.message }, { status: 500 });
        }
    },

    async getActiveTourLobby(request: Request, params?: { id: string }) {
        let id = params?.id;

        if (!id) {
            const url = new URL(request.url);
            // URL pattern: /api/active-tour/[id]/lobby
            const segments = url.pathname.split('/');
            id = segments[segments.length - 2];
        }

        if (!id) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const activeTourId = Number(id);
        if (isNaN(activeTourId)) {
            return Response.json({ error: 'Invalid activeTourId' }, { status: 400 });
        }

        try {
            const activeTour = await activeTourService.getActiveTourLobby(activeTourId);
            if (!activeTour) {
                return Response.json({ error: 'Active tour not found' }, { status: 404 });
            }
            return Response.json(activeTour);
        } catch (error: any) {
            console.error('Error fetching active tour lobby:', error);
            return Response.json({ error: 'Failed to fetch active tour lobby' }, { status: 500 });
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
            const { activeTourId, challengeId, userId } = body;

            const result = await activeTourService.failChallenge(Number(activeTourId), Number(challengeId), Number(userId));
            return Response.json(result);
        } catch (error) {
            console.error('Error failing challenge:', error);
            return Response.json({ error: 'Failed to update challenge status' }, { status: 500 });
        }
    },

    async abandonTour(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, userId } = body;

            if (!activeTourId || !userId) {
                return Response.json({ error: 'Missing activeTourId or userId' }, { status: 400 });
            }

            const updatedTour = await activeTourService.abandonTour(activeTourId, Number(userId));
            return Response.json(updatedTour);
        } catch (error) {
            console.error('Error abandoning tour:', error);
            return Response.json({ error: 'Failed to abandon tour' }, { status: 500 });
        }
    },

    async finishTour(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, userId } = body;

            const updatedTour = await activeTourService.finishTour(activeTourId, userId);
            return Response.json(updatedTour);
        } catch (error) {
            console.error('Error finishing tour:', error);
            return Response.json({ error: 'Failed to finish tour' }, { status: 500 });
        }
    },

    async updatePubGolfScore(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, stopId, sips, userId } = body;

            if (!activeTourId || !stopId || sips === undefined) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const updatedStop = await activeTourService.updatePubGolfScore(Number(activeTourId), Number(stopId), Number(sips), Number(userId));
            return Response.json(updatedStop);
        } catch (error) {
            console.error('Error updating pub golf score:', error);
            return Response.json({ error: 'Failed to update pub golf score' }, { status: 500 });
        }
    },

    async updateCurrentStop(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, currentStop, userId } = body;

            if (!activeTourId || currentStop === undefined) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const updatedTour = await activeTourService.updateCurrentStop(Number(activeTourId), Number(currentStop), Number(userId));
            return Response.json(updatedTour);
        } catch (error) {
            console.error('Error updating current stop:', error);
            return Response.json({ error: 'Failed to update current stop' }, { status: 500 });
        }
    },

    async updateTeam(request: Request) {
        try {
            const body = await request.json();
            const { activeTourId, userId, name, color, emoji } = body;

            if (!activeTourId || !userId) {
                return Response.json({ error: 'Missing required fields' }, { status: 400 });
            }

            const updatedTeam = await activeTourService.updateTeamDetails(Number(activeTourId), Number(userId), name, color, emoji);
            return Response.json(updatedTeam);
        } catch (error) {
            console.error('Error updating team:', error);
            return Response.json({ error: 'Failed to update team' }, { status: 500 });
        }
    }
};
