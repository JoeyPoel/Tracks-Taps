import { activeTourService } from "@/src/services/activeTourService";

export async function GET(request: Request, { id }: { id: string }) {
    if (!id) {
        return Response.json({ error: 'Missing activeTourId' }, { status: 400 });
    }

    const activeTourId = Number(id);
    if (isNaN(activeTourId)) {
        return Response.json({ error: 'Invalid activeTourId' }, { status: 400 });
    }

    try {
        const activeTour = await activeTourService.getActiveTourById(activeTourId);
        if (!activeTour) {
            return Response.json({ error: 'Active tour not found' }, { status: 404 });
        }
        return Response.json(activeTour);
    } catch (error) {
        console.error('Error fetching active tour details:', error);
        return Response.json({ error: 'Failed to fetch active tour details' }, { status: 500 });
    }
}
