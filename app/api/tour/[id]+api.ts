import { tourService } from "@/src/services/tourService";

export async function GET(request: Request, { id }: { id: string }) {
    if (!id) {
        return Response.json({ error: 'Missing tourId' }, { status: 400 });
    }

    const tourId = Number(id);
    if (isNaN(tourId)) {
        return Response.json({ error: 'Invalid tourId' }, { status: 400 });
    }

    try {
        const tour = await tourService.getTourById(tourId);
        if (!tour) {
            return Response.json({ error: 'Tour not found' }, { status: 404 });
        }
        return Response.json(tour);
    } catch (error) {
        console.error('Error fetching tour details:', error);
        return Response.json({ error: 'Failed to fetch tour details' }, { status: 500 });
    }
}
