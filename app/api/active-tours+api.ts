import { tourService } from '../../src/services/tourService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    try {
        const activeTours = await tourService.getActiveToursForUser(parseInt(userId));
        return Response.json(activeTours);
    } catch (error) {
        console.error('Error fetching active tours:', error);
        return Response.json({ error: 'Failed to fetch active tours' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, tourId, force } = body;

        if (!userId || !tourId) {
            return Response.json({ error: 'Missing userId or tourId' }, { status: 400 });
        }

        // Check for existing active tours
        const activeTours = await tourService.getActiveToursForUser(userId);

        if (activeTours.length > 0) {
            if (!force) {
                return Response.json({
                    error: 'User already has an active tour',
                    activeTour: activeTours[0]
                }, { status: 409 });
            }

            // If force is true, delete existing active tours
            for (const tour of activeTours) {
                await tourService.deleteActiveTour(tour.id);
            }
        }

        // Create new active tour
        const newActiveTour = await tourService.startTour(tourId, userId);
        return Response.json(newActiveTour);

    } catch (error) {
        console.error('Error starting tour:', error);
        return Response.json({ error: 'Failed to start tour' }, { status: 500 });
    }
}
