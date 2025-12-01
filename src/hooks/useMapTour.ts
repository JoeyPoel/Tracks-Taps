import { useFetch } from './useFetch';

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
    const { data, loading, error, refetch } = useFetch<Tour[]>(`/api/map-tours`);
    return { tours: data || [], loading, error, refetch };
}
