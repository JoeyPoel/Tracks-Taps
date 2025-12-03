import { tourRepository } from '../repositories/tourRepository';

export const tourService = {
    async getAllTours() {
        return await tourRepository.getAllTours();
    },

    async getTourById(id: number) {
        return await tourRepository.getTourById(id);
    },
};
