import { useEffect, useMemo } from 'react';
import { useStore } from '../store/store';

export const useTourDetails = (tourId: number, sortBy?: string) => {
    const tour = useStore((state) => state.tourDetails[tourId]);
    const loading = useStore((state) => state.loadingTours && !state.tourDetails[tourId]);
    const error = useStore((state) => state.errorTours);
    const fetchTourDetails = useStore((state) => state.fetchTourDetails);

    useEffect(() => {
        if (!tourId) return;

        // Determine if we need to force a fetch (mount, sorting change, or incomplete data)
        const isFirstLoad = !tour;
        const hasSortChange = !!sortBy; // If sortBy is provided, we treat it as a deliberate filter change
        
        const reviewCount = (tour as any)?.reviewCount || 0;
        const needsMoreReviews = reviewCount > 0 && (!tour?.reviews || tour.reviews.length === 0);
        const hasDummyReviews = tour?.reviews?.some((r: any) => !r.id);
        const hasNoAuthorDetails = tour?.reviews?.some((r: any) => r.authorId && !r.author);
        
        const isIncomplete = tour && (
            !tour.stops || 
            tour.stops.length === 0 || 
            !tour.reviews || 
            needsMoreReviews ||
            hasDummyReviews || 
            hasNoAuthorDetails
        );

        // Fetch if it's the first time, if we have a sort change, or if data is incomplete
        // We use force: true to ensure the store doesn't bail out
        // Map UI sort values to backend expected values if necessary
        const backendSort = sortBy === 'highest' ? 'highest_rating' 
                          : sortBy === 'lowest' ? 'lowest_rating' 
                          : sortBy;

        fetchTourDetails(tourId, undefined, true, sortBy ? { reviewsSortBy: backendSort } : undefined);
    }, [tourId, sortBy, fetchTourDetails]);

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
