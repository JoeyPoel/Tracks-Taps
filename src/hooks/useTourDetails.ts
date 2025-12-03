import { useCallback, useEffect, useState } from 'react';
import { tourService } from '../services/tourService';
import { Tour } from './useTours';

export interface Review {
    id: number;
    content: string;
    rating: number;
    photos: string[];
    createdAt: string;
    author: {
        name: string;
    };
}

export interface TourDetail extends Tour {
    reviews: Review[];
    challenges: any[];
    stops: any[];
}

export function useTourDetails(tourId: number) {
    const [data, setData] = useState<TourDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!tourId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await tourService.getTourById(tourId);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { tour: data, loading, error };
}
