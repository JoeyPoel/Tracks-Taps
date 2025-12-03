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

    async getTourById(request: Request, params: { id: string }) {
        const { id } = params;
        if (!id) {
            return Response.json({ error: 'Missing tourId' }, { status: 400 });
        }

        try {
            const tour = await tourService.getTourById(parseInt(id));
            if (!tour) {
                return Response.json({ error: 'Tour not found' }, { status: 404 });
            }
            return Response.json(tour);
        } catch (error) {
            console.error('Error fetching tour details:', error);
            return Response.json({ error: 'Failed to fetch tour details' }, { status: 500 });
        }
    }
};
