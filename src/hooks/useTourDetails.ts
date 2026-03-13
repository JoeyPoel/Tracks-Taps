import { useEffect, useMemo } from 'react';
import { useStore } from '../store/store';

export const useTourDetails = (tourId: number) => {
    const tour = useStore((state) => state.tourDetails[tourId]);
    const loading = useStore((state) => state.loadingTours && !state.tourDetails[tourId]);
    const error = useStore((state) => state.errorTours);
    const fetchTourDetails = useStore((state) => state.fetchTourDetails);

    useEffect(() => {
        // Data is considered incomplete if:
        // 1. We don't have stops (they are never fetched in the list)
        // 2. We don't have reviews (they are never fetched in the list)
        // 3. We HAVE reviews but they are "dummy" reviews (missing IDs) from the list fetch aggregate
        // 4. We HAVE reviews but they are missing author details (author field)
        // 5. We have a reviewCount > 0 but actual reviews array is empty
        const hasDummyReviews = tour?.reviews?.some((r: any) => !r.id);
        const hasNoAuthorDetails = tour?.reviews?.some((r: any) => r.authorId && !r.author);
        const reviewCount = (tour as any).reviewCount || 0;
        const needsMoreReviews = reviewCount > 0 && (!tour?.reviews || tour.reviews.length === 0);
        
        const isIncomplete = tour && (
            !tour.stops || 
            tour.stops.length === 0 || 
            !tour.reviews || 
            needsMoreReviews ||
            hasDummyReviews || 
            hasNoAuthorDetails
        );
        
        if (tourId && (!tour || isIncomplete)) {
            // Pass isIncomplete as force flag to ensure full fetch triggers
            fetchTourDetails(tourId, undefined, isIncomplete);
        }
    }, [tourId, tour, fetchTourDetails]);

    const { stats, reviewsData } = useMemo(() => {
        if (!tour) {
            return {
                stats: { rating: 0, count: 0 },
                reviewsData: []
            };
        }

        const count = (tour as any).reviewCount ?? tour.reviews?.length ?? 0;
        const rating = (tour as any).averageRating ?? (
            (tour.reviews?.length || 0) > 0
                ? tour.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / tour.reviews.length
                : 0
        );

        const mappedReviews = (tour.reviews || [])
            .filter((review: any) => review.id) // Filter out dummy reviews
            .map((review: any) => ({
                id: review.id.toString(),
                userId: (review.author?.id || review.authorId || '').toString() || 'unknown',
                name: review.author?.name || 'Unknown',
                userAvatar: review.author?.avatarUrl || null,
                rating: review.rating || 0,
                date: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent',
                createdAt: review.createdAt || new Date(),
                comment: review.content || '',
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
        refetch: () => fetchTourDetails(tourId, undefined, true),
        averageRating: stats.rating,
        reviewCount: stats.count,
        formattedReviews: reviewsData
    };
};
