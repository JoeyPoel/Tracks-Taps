import { tourRepository } from '../repositories/tourRepository';

import { TourFilters } from '../../src/types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        return await tourRepository.getAllTours(filters);
    },

    async getTourById(id: number) {
        return await tourRepository.getTourById(id);
    },
};
