import { activeTourService } from "@/src/services/activeTourService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { activeTourId, challengeId } = body;

        if (!activeTourId || !challengeId) {
            return Response.json({ error: 'Missing activeTourId or challengeId' }, { status: 400 });
        }

        const result = await activeTourService.completeChallenge(Number(activeTourId), Number(challengeId));
        return Response.json(result);
    } catch (error) {
        console.error('Error completing challenge:', error);
        return Response.json({ error: 'Failed to complete challenge' }, { status: 500 });
    }
}
