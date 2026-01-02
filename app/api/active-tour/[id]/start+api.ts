import { activeTourService } from '@/backend/services/activeTourService';

// Helper to standardise responses
const jsonResponse = (data: any, status = 200) => Response.json(data, { status });
const errorResponse = (message: string, status = 400) => Response.json({ error: message }, { status });

export async function POST(request: Request, props: any) {
    try {
        const { userId } = await request.json();
        let activeTourId: number;

        if (props?.params?.id) {
            activeTourId = Number(props.params.id);
        } else {
            // Fallback: try to extract from URL
            const url = new URL(request.url);
            const segments = url.pathname.split('/');
            // Expected pattern: /api/active-tour/[id]/start
            // segments might be ['', 'api', 'active-tour', '123', 'start']
            // So id is at length - 2
            const idStr = segments[segments.length - 2];
            activeTourId = Number(idStr);
        }

        if (!activeTourId || isNaN(activeTourId)) {
            return errorResponse('Invalid active tour ID');
        }

        if (!userId) {
            return errorResponse('Missing User ID', 400);
        }

        const result = await activeTourService.startTourSession(activeTourId, userId);
        return jsonResponse(result);
    } catch (error: any) {
        console.error('API Error:', error);
        return errorResponse(error.message || 'Internal Server Error', 500);
    }
}
