import { useEffect } from 'react';
import { useStore } from '../store/store';



export const useTourDetails = (tourId: number) => {
    const tour = useStore((state) => state.tourDetails[tourId]);
    const loading = useStore((state) => state.loadingTours);
    const error = useStore((state) => state.errorTours);
    const fetchTourDetails = useStore((state) => state.fetchTourDetails);

    useEffect(() => {
        if (tourId) {
            fetchTourDetails(tourId);
        }
    }, [tourId, fetchTourDetails]);

    return { tour, loading, error, refetch: () => fetchTourDetails(tourId) };
};
