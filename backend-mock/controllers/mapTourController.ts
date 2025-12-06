import { mapTourService } from '../services/mapTourService';

export const mapTourController = {
    async getTours(request: Request) {
        try {
            const url = new URL(request.url);
            const minLat = url.searchParams.get('minLat');
            const maxLat = url.searchParams.get('maxLat');
            const minLng = url.searchParams.get('minLng');
            const maxLng = url.searchParams.get('maxLng');

            let bounds;
            if (minLat && maxLat && minLng && maxLng) {
                bounds = {
                    minLat: parseFloat(minLat),
                    maxLat: parseFloat(maxLat),
                    minLng: parseFloat(minLng),
                    maxLng: parseFloat(maxLng),
                };
            }

            const tours = await mapTourService.getTours(bounds);
            return Response.json(tours);
        } catch (error) {
            console.error('Error fetching map tours:', error);
            return Response.json({ error: 'Failed to fetch map tours' }, { status: 500 });
        }
    }
};
