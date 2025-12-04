import { useEffect } from 'react';
import { useStore } from '../store/store';

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

export const useTours = () => {
    const tours = useStore((state) => state.tours);
    const loading = useStore((state) => state.loadingTours);
    const error = useStore((state) => state.errorTours);
    const fetchTours = useStore((state) => state.fetchTours);

    useEffect(() => {
        fetchTours();
    }, [fetchTours]);

    return { tours, loading, error, refetch: fetchTours };
};
