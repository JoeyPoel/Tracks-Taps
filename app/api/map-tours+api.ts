import { mapTourService } from '../../src/services/mapTourService';

export async function GET() {
    try {
        const tours = await mapTourService.getTours();
        return Response.json(tours);
    } catch (error) {
        console.error('Error fetching map tours:', error);
        return Response.json({ error: 'Failed to fetch map tours' }, { status: 500 });
    }
}
