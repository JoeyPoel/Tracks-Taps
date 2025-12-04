import { useEffect } from 'react';
import { useStore } from '../store/store';

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

export const useMapTours = () => {
    const tours = useStore((state) => state.mapTours);
    const loading = useStore((state) => state.loadingTours);
    const error = useStore((state) => state.errorTours);
    const fetchMapTours = useStore((state) => state.fetchMapTours);

    useEffect(() => {
        fetchMapTours();
    }, [fetchMapTours]);

    return { tours, loading, error, refetch: fetchMapTours };
};
