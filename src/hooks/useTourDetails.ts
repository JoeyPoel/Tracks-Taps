import { useEffect, useMemo } from 'react';
import { useStore } from '../store/store';

export const useTourDetails = (tourId: number) => {
    const tour = useStore((state) => state.tourDetails[tourId]);
    const loading = useStore((state) => state.loadingTours && !state.tourDetails[tourId]);
    const error = useStore((state) => state.errorTours);
    const fetchTourDetails = useStore((state) => state.fetchTourDetails);

    useEffect(() => {
        if (tourId && !tour) {
            fetchTourDetails(tourId);
        }
    }, [tourId, tour, fetchTourDetails]);

    const { stats, reviewsData } = useMemo(() => {
        if (!tour) {
            return {
                stats: { rating: 0, count: 0 },
                reviewsData: []
            };
        }

        const count = tour.reviews?.length || 0;
        const rating = count > 0
            ? tour.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / count
            : 0;

        const mappedReviews = (tour.reviews || []).map((review: any) => ({
            id: review.id.toString(),
            userId: review.authorId ? review.authorId.toString() : 'unknown',
            userName: review.author?.name || 'Unknown',
            // Simple deterministic avatar based on name
            userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author?.name || 'User')}&background=random`,
            rating: review.rating,
            date: new Date(review.createdAt).toLocaleDateString(),
            comment: review.content,
            images: review.photos || [],
        }));

        return {
            stats: { rating, count },
            reviewsData: mappedReviews
        };
    }, [tour]);

    return {
        tour,
        loading,
        error,
        refetch: () => fetchTourDetails(tourId),
        averageRating: stats.rating,
        reviewCount: stats.count,
        formattedReviews: reviewsData
    };
};
