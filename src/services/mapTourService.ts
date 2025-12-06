import client from '../api/client';

export const mapTourService = {
    async getTours(bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
        let url = '/map-tours';
        if (bounds) {
            const params = new URLSearchParams();
            params.append('minLat', bounds.minLat.toString());
            params.append('maxLat', bounds.maxLat.toString());
            params.append('minLng', bounds.minLng.toString());
            params.append('maxLng', bounds.maxLng.toString());
            url += `?${params.toString()}`;
        }
        const response = await client.get(url);
        return response.data;
    }
};
