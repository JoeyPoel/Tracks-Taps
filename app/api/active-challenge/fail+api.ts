import { tourService } from "@/src/services/tourService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { activeTourId, challengeId } = body;

        if (!activeTourId || !challengeId) {
            return Response.json({ error: 'Missing activeTourId or challengeId' }, { status: 400 });
        }

        const result = await tourService.failChallenge(activeTourId, challengeId);
        return Response.json(result);
    } catch (error) {
        console.error('Error failing challenge:', error);
        return Response.json({ error: 'Failed to update challenge status' }, { status: 500 });
    }
}
