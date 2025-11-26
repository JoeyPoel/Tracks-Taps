import { useFetch } from './useFetch';
import { Tour } from './useTours';

export interface ActiveTour {
    id: number;
    tourId: number;
    status: string;
    tour: Tour;
    progress?: number;
}

export function useActiveTours(userId?: number) {
    const url = userId ? `/api/active-tours?userId=${userId}` : null;
    const { data, loading, error } = useFetch<ActiveTour[]>(url);
    return { activeTours: data || [], loading, error };
}
