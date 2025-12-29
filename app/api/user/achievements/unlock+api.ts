import { achievementController } from '@/backend/controllers/achievementController';
import { verifyAuth } from '@/backend/utils/auth';

export async function POST(request: Request) {
    const user = await verifyAuth(request);

    // Optional: stricter auth check (ensure user.id matches body.userId)
    // For now we rely on the controller or basic verifying 
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return await achievementController.unlockAchievement(request);
}
