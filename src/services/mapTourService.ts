import client from '../api/client';

export const mapTourService = {
    async getTours() {
        const response = await client.get('/map-tours');
        return response.data;
    }
};
