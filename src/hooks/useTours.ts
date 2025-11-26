import { useFetch } from './useFetch';

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
    const { data, loading, error } = useFetch<Tour[]>('/api/tours');
    return { tours: data || [], loading, error };
}
