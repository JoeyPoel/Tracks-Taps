import { tourService } from '../../src/services/tourService';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

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
