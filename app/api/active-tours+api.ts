import { tourService } from '../../src/services/tourService';

export async function GET({ params }: { params: { userId: string } }) {
    const userId = params.userId;

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
