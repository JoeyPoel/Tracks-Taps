import { Prisma } from '@prisma/client';
import { tourRepository } from '../repositories/tourRepository';

import { TourFilters } from '../../src/types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        return await tourRepository.getAllTours(filters);
    },

    async getTourById(id: number) {
        return await tourRepository.getTourById(id);
    },

    async createTour(data: Prisma.TourCreateInput) {
        return await tourRepository.createTour(data);
    },
};
