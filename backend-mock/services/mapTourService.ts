import { mapTourRepository } from '../repositories/mapTourRepository';

export const mapTourService = {
    async getTours(bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }) {
        return await mapTourRepository.getTours(bounds);
    },
};