import { savedTripsRepository } from '../repositories/savedTripsRepository';

export const savedTripsService = {
    async createSavedTrip(userId: number, name: string) {
        return savedTripsRepository.create(userId, name);
    },

    async getUserSavedTrips(userId: number) {
        return savedTripsRepository.findByUserId(userId);
    },

    async getSavedTrip(id: number) {
        return savedTripsRepository.findById(id);
    },

    async deleteSavedTrip(id: number, userId: number) {
        // Verify ownership
        const list = await savedTripsRepository.findById(id);
        if (!list) throw new Error('Saved trip list not found');
        if (list.userId !== userId) throw new Error('Unauthorized');

        return savedTripsRepository.delete(id);
    },

    async updateSavedTripName(id: number, userId: number, name: string) {
        const list = await savedTripsRepository.findById(id);
        if (!list) throw new Error('Saved trip list not found');
        if (list.userId !== userId) throw new Error('Unauthorized');

        return savedTripsRepository.updateName(id, name);
    },

    async addTourToSavedTrip(listId: number, userId: number, tourId: number) {
        const list = await savedTripsRepository.findById(listId);
        if (!list) throw new Error('Saved trip list not found');
        if (list.userId !== userId) throw new Error('Unauthorized');

        return savedTripsRepository.addTour(listId, tourId);
    },

    async removeTourFromSavedTrip(listId: number, userId: number, tourId: number) {
        const list = await savedTripsRepository.findById(listId);
        if (!list) throw new Error('Saved trip list not found');
        if (list.userId !== userId) throw new Error('Unauthorized');

        return savedTripsRepository.removeTour(listId, tourId);
    }
};
