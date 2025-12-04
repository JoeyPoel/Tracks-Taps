import { useEffect } from 'react';
import { useStore } from '../store/store';

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

export interface TourDetail {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    distance: number;
    duration: number;
    points: number;
    modes: string[];
    difficulty: string;
    author: {
        name: string;
    };
    reviews: Review[];
    challenges: any[];
    stops: any[];
}

export const useTourDetails = (tourId: number) => {
    const tour = useStore((state) => state.tourDetails[tourId]);
    const loading = useStore((state) => state.loadingTours);
    const error = useStore((state) => state.errorTours);
    const fetchTourDetails = useStore((state) => state.fetchTourDetails);

    useEffect(() => {
        if (tourId) {
            fetchTourDetails(tourId);
        }
    }, [tourId, fetchTourDetails]);

    return { tour, loading, error, refetch: () => fetchTourDetails(tourId) };
};
