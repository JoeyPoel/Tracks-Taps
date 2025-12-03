import { mapTourService } from '../services/mapTourService';

export const mapTourController = {
    async getTours() {
        try {
            const tours = await mapTourService.getTours();
            return Response.json(tours);
        } catch (error) {
            console.error('Error fetching map tours:', error);
            return Response.json({ error: 'Failed to fetch map tours' }, { status: 500 });
        }
    }
};
