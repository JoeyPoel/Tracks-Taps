import { activeTourService } from "@/src/services/activeTourService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { activeTourId } = body;

        if (!activeTourId) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const updatedTour = await activeTourService.finishTour(Number(activeTourId));
        return Response.json(updatedTour);

    } catch (error) {
        console.error('Error finishing tour:', error);
        return Response.json({ error: 'Failed to finish tour' }, { status: 500 });
    }
}
