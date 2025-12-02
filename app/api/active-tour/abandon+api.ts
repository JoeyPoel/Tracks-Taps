import { activeTourService } from "@/src/services/activeTourService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { activeTourId } = body;

        if (!activeTourId) {
            return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
        }

        const updatedTour = await activeTourService.abandonTour(Number(activeTourId));
        return Response.json(updatedTour);

    } catch (error) {
        console.error('Error abandoning tour:', error);
        return Response.json({ error: 'Failed to abandon tour' }, { status: 500 });
    }
}
