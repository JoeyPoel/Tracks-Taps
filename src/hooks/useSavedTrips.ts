import { useCallback, useState } from 'react';
import { SavedTrip, savedTripsService } from '../services/savedTripsService';

export function useSavedTrips() {
    const [lists, setLists] = useState<SavedTrip[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadLists = useCallback(async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
            }
            setError(null);

            const currentPage = reset ? 1 : page;
            const response: any = await savedTripsService.getAll(currentPage, 20);

            let newItems: SavedTrip[] = [];
            if (response.data && Array.isArray(response.data)) {
                newItems = response.data;
            } else if (Array.isArray(response)) {
                newItems = response;
            }

            if (reset) {
                setLists(newItems);
                setPage(2);
                setHasMore(newItems.length >= 20);
            } else {
                if (newItems.length > 0) {
                    setLists(prev => [...prev, ...newItems]);
                    setPage(prev => prev + 1);
                }
                if (newItems.length < 20) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.error('Failed to load saved trips', err);
            setError('Failed to load saved trips');
        } finally {
            setLoading(false);
        }
    }, [page]);

    const refresh = useCallback(() => {
        loadLists(true);
    }, [loadLists]);

    // loadMore just calls loadLists(false) if !loading && hasMore
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadLists(false);
        }
    }, [loading, hasMore, loadLists]);

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
        loadLists: refresh, // Default to refresh behavior
        loadMore,
        hasMore,
        createList,
        addTourToList,
        removeTourFromList,
        checkIsSaved
    };
}
