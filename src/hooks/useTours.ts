import { useCallback, useEffect, useState } from 'react';
import { tourService } from '../services/tourService';

export interface Tour {
    id: number;
    title: string;
    location: string;
    description: string;
    imageUrl: string;
    distance: number;
    duration: number;
    points: number;
    modes: string[];
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    author: {
        name: string;
    };
    _count: {
        stops: number;
    };
}

export function useTours() {
    const [data, setData] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await tourService.getAllTours();
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

    return { tours: data, loading, error };
}
