import { tourService } from '../services/tourService';

export const tourController = {
    async getAllTours() {
        try {
            const tours = await tourService.getAllTours();
            return Response.json(tours);
        } catch (error) {
            console.error('Error fetching tours:', error);
            return Response.json({ error: 'Failed to fetch tours' }, { status: 500 });
        }
    },

    async getTourById(request: Request, params?: { id: string }) {
        let id = params?.id;

        if (!id) {
            // Fallback: try to extract from URL
            const url = new URL(request.url);
            const segments = url.pathname.split('/');
            id = segments[segments.length - 1];
        }

        if (!id) {
            return Response.json({ error: 'Missing tourId' }, { status: 400 });
        }

        const tourId = Number(id);
        if (isNaN(tourId)) {
            return Response.json({ error: 'Invalid tourId' }, { status: 400 });
        }

        try {
            const tour = await tourService.getTourById(tourId);
            if (!tour) {
                return Response.json({ error: 'Tour not found' }, { status: 404 });
            }
            return Response.json(tour);
        } catch (error: any) {
            console.error('Error fetching tour details:', error);
            return Response.json({ error: 'Failed to fetch tour details', details: error.message }, { status: 500 });
        }
    }
};
