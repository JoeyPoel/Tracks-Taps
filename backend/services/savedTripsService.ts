import { savedTripsRepository } from '../repositories/savedTripsRepository';

export const savedTripsService = {
    async createSavedTrip(userId: number, name: string) {
        return savedTripsRepository.create(userId, name);
    },

    async getUserSavedTrips(userId: number, page: number = 1, limit: number = 10) {
        // Ensure "Favourites" list exists
        const lists = await savedTripsRepository.findByUserId(userId, 1, 100);
        const hasFavourites = lists.data.some((l: any) => l.name === 'Favourites');

        if (!hasFavourites) {
            await savedTripsRepository.create(userId, 'Favourites');
        }

        return savedTripsRepository.findByUserId(userId, page, limit);
    },

    async getSavedTrip(id: number) {
        return savedTripsRepository.findById(id);
    },

    async deleteSavedTrip(id: number, userId: number) {
        // Verify ownership
        const isOwner = await savedTripsRepository.checkOwnership(id, userId);
        if (isOwner === undefined) throw new Error('Saved trip list not found');
        if (!isOwner) throw new Error('Unauthorized');

        return savedTripsRepository.delete(id);
    },

    async updateSavedTripName(id: number, userId: number, name: string) {
        const isOwner = await savedTripsRepository.checkOwnership(id, userId);
        if (isOwner === undefined) throw new Error('Saved trip list not found');
        if (!isOwner) throw new Error('Unauthorized');

        return savedTripsRepository.updateName(id, name);
    },

    async addTourToSavedTrip(listId: number, userId: number, tourId: number) {
        const isOwner = await savedTripsRepository.checkOwnership(listId, userId);
        if (isOwner === undefined) throw new Error('Saved trip list not found');
        if (!isOwner) throw new Error('Unauthorized');

        return savedTripsRepository.addTour(listId, tourId);
    },

    async removeTourFromSavedTrip(listId: number, userId: number, tourId: number) {
        const isOwner = await savedTripsRepository.checkOwnership(listId, userId);
        if (isOwner === undefined) throw new Error('Saved trip list not found');
        if (!isOwner) throw new Error('Unauthorized');

        return savedTripsRepository.removeTour(listId, tourId);
    },

    async updateTourOrder(listId: number, userId: number, tourIds: number[]) {
        const isOwner = await savedTripsRepository.checkOwnership(listId, userId);
        if (isOwner === undefined) throw new Error('Saved trip list not found');
        if (!isOwner) throw new Error('Unauthorized');

        return savedTripsRepository.updateOrder(listId, tourIds);
    }
};
