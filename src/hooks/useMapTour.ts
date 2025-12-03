import { useCallback, useEffect, useState } from 'react';
import { mapTourService } from '../services/mapTourService';

export interface Tour {
    id: number;
    title: string;
    stops: Stop[];
}

export interface Stop {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    tourId: number;
}

export function useMapTours() {
    const [data, setData] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await mapTourService.getTours();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { tours: data, loading, error, refetch: fetchData };
}
