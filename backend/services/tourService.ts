import { Prisma } from '@prisma/client';
import { tourRepository } from '../repositories/tourRepository';
import { achievementService } from './achievementService';

import { TourFilters } from '../../src/types/filters';

export const tourService = {
    async getAllTours(filters?: TourFilters) {
        return await tourRepository.getAllTours(filters);
    },

    async getTourById(id: number) {
        return await tourRepository.getTourById(id);
    },

    async createTour(data: Prisma.TourCreateInput) {
        const tour = await tourRepository.createTour(data);
        // data.author.connect.id is how author is linked usually
        if (data.author && data.author.connect && data.author.connect.id) {
            await achievementService.checkCreatedToursCount(data.author.connect.id);
        }
        return tour;
    },
};
