import { activeTourService } from "@/src/services/activeTourService";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { activeTourId, challengeId, userId } = body;

        if (!activeTourId || !challengeId || !userId) {
            return Response.json({ error: 'Missing activeTourId, challengeId, or userId' }, { status: 400 });
        }

        const result = await activeTourService.completeChallenge(Number(activeTourId), Number(challengeId), Number(userId));
        return Response.json(result);
    } catch (error) {
        console.error('Error completing challenge:', error);
        return Response.json({ error: 'Failed to complete challenge' }, { status: 500 });
    }
}
