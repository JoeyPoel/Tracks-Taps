import { useEffect } from 'react';
import { useStore } from '../store/store';

export const useActiveTours = (userId?: number) => {
    const activeTours = useStore((state) => state.activeTours);
    const loading = useStore((state) => state.loadingActiveTours);
    const error = useStore((state) => state.errorActiveTours);
    const fetchActiveTours = useStore((state) => state.fetchActiveTours);

    useEffect(() => {
        if (userId) {
            fetchActiveTours(userId);
        }
    }, [userId, fetchActiveTours]);

    return { activeTours, loading, error, refetch: () => userId && fetchActiveTours(userId) };
};
