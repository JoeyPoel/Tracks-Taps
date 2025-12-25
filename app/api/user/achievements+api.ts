
import { achievementController } from '@/backend/controllers/achievementController';

export async function GET(request: Request) {
    return await achievementController.getUserAchievements(request);
}
