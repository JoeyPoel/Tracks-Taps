import { activeTourService } from '@/backend/services/activeTourService';
import { userService } from '@/backend/services/userService';

// Helper to standardise responses
const jsonResponse = (data: any, status = 200) => Response.json(data, { status });
const errorResponse = (message: string, status = 400) => Response.json({ error: message }, { status });

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const { email } = await request.json();
        const activeTourId = Number(params.id);

        if (!activeTourId || isNaN(activeTourId)) {
            return errorResponse('Invalid active tour ID');
        }

        const user = await userService.getUserByEmail(email);
        if (!user) return errorResponse('User not found', 404);

        const result = await activeTourService.startTourSession(activeTourId, user.id);
        return jsonResponse(result);
    } catch (error: any) {
        console.error('API Error:', error);
        return errorResponse(error.message || 'Internal Server Error', 500);
    }
}
