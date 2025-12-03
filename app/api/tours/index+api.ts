import { tourService } from '../../../backend-mock/services/tourService';

export async function GET() {
    try {
        const tours = await tourService.getAllTours();
        return Response.json(tours);
    } catch (error) {
        console.error('Error fetching tours:', error);
        return Response.json({ error: 'Failed to fetch tours', details: String(error) }, { status: 500 });
    }
}
