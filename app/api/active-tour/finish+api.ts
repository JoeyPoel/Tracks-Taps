import { tourService } from "@/src/services/tourService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { activeTourId } = body;

        if (!activeTourId) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const updatedTour = await tourService.finishTour(activeTourId);
        return Response.json(updatedTour);

    } catch (error) {
        console.error('Error finishing tour:', error);
        return Response.json({ error: 'Failed to finish tour' }, { status: 500 });
    }
}
