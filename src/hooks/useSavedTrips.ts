import { useCallback, useState } from 'react';
import { SavedTrip, savedTripsService } from '../services/savedTripsService';

export function useSavedTrips() {
    const [lists, setLists] = useState<SavedTrip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLists = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await savedTripsService.getAll();
            setLists(data);
        } catch (err) {
            console.error('Failed to load saved trips', err);
            setError('Failed to load saved trips');
        } finally {
            setLoading(false);
        }
    }, []);

    const createList = useCallback(async (name: string) => {
        try {
            const newList = await savedTripsService.create(name);
            setLists(prev => [newList, ...prev]);
            return newList;
        } catch (err) {
            console.error('Failed to create list', err);
            throw err;
        }
    }, []);

    const addTourToList = useCallback(async (listId: number, tourId: number) => {
        try {
            // Optimistic update
            setLists(current => current.map(l => {
                if (l.id !== listId) return l;
                const tours = l.tours || [];
                // @ts-ignore: Partial tour object for optimistic update
                return { ...l, tours: [...tours, { id: tourId } as any] };
            }));

            await savedTripsService.addTour(listId, tourId);
            // Background refresh to ensure consistency
            loadLists();
        } catch (err) {
            console.error('Failed to add tour to list', err);
            loadLists(); // Revert on error
            throw err;
        }
    }, [loadLists]);

    const removeTourFromList = useCallback(async (listId: number, tourId: number) => {
        try {
            // Optimistic update
            setLists(current => current.map(l => {
                if (l.id !== listId) return l;
                return { ...l, tours: (l.tours || []).filter(t => t.id !== tourId) };
            }));

            await savedTripsService.removeTour(listId, tourId);
            // Background refresh
            loadLists();
        } catch (err) {
            console.error('Failed to remove tour from list', err);
            loadLists(); // Revert
            throw err;
        }
    }, [loadLists]);

    const checkIsSaved = useCallback((tourId: number) => {
        return lists.some(list => list.tours?.some(t => t.id === tourId));
    }, [lists]);

    return {
        lists,
        loading,
        error,
        loadLists,
        createList,
        addTourToList,
        removeTourFromList,
        checkIsSaved
    };
}
