import { tourService } from '../../../src/services/tourService';

export async function GET(request: Request, { id }: { id: string }) {
    if (!id) {
        return Response.json({ error: 'Missing tourId' }, { status: 400 });
    }

    try {
        const tour = await tourService.getTourById(parseInt(id));
        if (!tour) {
            return Response.json({ error: 'Tour not found' }, { status: 404 });
        }
        return Response.json(tour);
    } catch (error) {
        console.error('Error fetching tour details:', error);
        return Response.json({ error: 'Failed to fetch tour details' }, { status: 500 });
    }
}
