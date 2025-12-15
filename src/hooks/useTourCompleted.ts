import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { tourService } from '../services/tourService';
import { useStore } from '../store/store';
import { Team } from '../types/models';

export const useTourCompleted = (activeTourId: number) => {
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useUserContext();
    const {
        activeTour,
        fetchActiveTourById,
        loadingActiveTours: loading,
        errorActiveTours: error,
        fetchTourDetails // Import fetchTourDetails
    } = useStore();

    const [activeTeams, setActiveTeams] = useState<Team[]>([]);
    const [winner, setWinner] = useState<Team>();
    const [showReviewForm, setShowReviewForm] = useState(false);

    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (activeTourId) {
            fetchActiveTourById(activeTourId, user?.id);
        }
    }, [activeTourId, user?.id]);

    useEffect(() => {
        if (activeTour && activeTour.teams) {
            // Sort teams by score DESC, and finishedAt ASC for ties
            const sortedTeams = [...activeTour.teams].sort((a, b) => {
                const scoreA = a.score ?? 0;
                const scoreB = b.score ?? 0;
                if (scoreB !== scoreA) {
                    return scoreB - scoreA;
                }
                const timeA = a.finishedAt ? new Date(a.finishedAt).getTime() : Number.MAX_SAFE_INTEGER;
                const timeB = b.finishedAt ? new Date(b.finishedAt).getTime() : Number.MAX_SAFE_INTEGER;
                return timeA - timeB;
            });

            setActiveTeams(sortedTeams);

            // Assume first is winner if finished
            if (sortedTeams.length > 0) {
                setWinner(sortedTeams[0]);
            }
        }
    }, [activeTour]);

    const handleCreateReview = async (rating: number, content: string, photos: string[]) => {
        if (!user) {
            Alert.alert(t('error'), t('mustBeLoggedIn'));
            return;
        }

        if (!activeTour?.tourId) {
            console.error('Missing tourId for review');
            Alert.alert(t('error'), 'Tour data is missing. Cannot submit review.');
            return;
        }

        console.log('Submitting review for tourId:', activeTour.tourId);
        setSubmittingReview(true);
        try {
            const result = await tourService.createReview(activeTour.tourId, {
                rating,
                content,
                photos
            });
            console.log('Review submitted successfully:', result);

            // Force refetch details so the new review appears
            console.log('Refetching tour details...');
            await fetchTourDetails(activeTour.tourId, undefined, true);
            console.log('Tour details refetched.');

            setShowReviewForm(false);

            // Navigate to explore
            console.log('Navigating to /explore');

            // Just navigate to explore. Using router.replace ensures we swap the current screen (modal/completed) 
            // with explore, or just go there. safely.
            // In expo-router stack, replace helps avoid going back.
            // router.dismissAll() might be unmounting the root layout or something unexpected.

            // Use navigate to go to the tabs route reliably.
            router.navigate('/(tabs)/explore');
        } catch (error: any) {
            console.error('Error submitting review:', error);
            // detailed logging
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            Alert.alert(t('error'), t('reviewSubmitError') + (error.message ? `: ${error.message}` : ''));
        } finally {
            console.log('Setting submittingReview to false');
            setSubmittingReview(false);
        }
    };

    const handleBackToHome = () => {
        router.navigate('/(tabs)/explore');
    };

    return {
        activeTour,
        loading,
        error,
        activeTeams,
        winner,
        showReviewForm,
        setShowReviewForm,
        handleCreateReview,
        submittingReview,
        handleBackToHome,
        t
    };
};