import { useFetch } from './useFetch';
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
    const url = tourId ? `/api/tour/${tourId}` : null;
    const { data, loading, error } = useFetch<TourDetail>(url);
    return { tour: data, loading, error };
}
