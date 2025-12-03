import { useCallback, useEffect, useState } from 'react';
import { activeTourService } from '../services/activeTourService';
import { Tour } from './useTours';

export interface ActiveTour {
    id: number;
    tourId: number;
    status: string;
    tour: Tour;
    progress?: number;
}

export function useActiveTours(userId?: number) {
    const [data, setData] = useState<ActiveTour[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await activeTourService.getActiveToursForUser(userId);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { activeTours: data, loading, error, refetch: fetchData };
}
