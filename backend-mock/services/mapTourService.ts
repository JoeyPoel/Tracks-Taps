import { mapTourRepository } from '../repositories/mapTourRepository';

export const mapTourService = {
    async getTours() {
        return await mapTourRepository.getTours();
    },
};