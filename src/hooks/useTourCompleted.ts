import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { feedbackService } from '../services/feedbackService';
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

    const cleanupAndExit = async () => {
        if (activeTourId && user?.id) {
            try {
                await useStore.getState().abandonTour(activeTourId, user.id);
            } catch (ignore) {
                console.warn('Cleanup failed:', ignore);
            }
        }
        router.navigate('/(tabs)/explore');
    };

    const confirmAndExit = () => {
        Alert.alert(
            t('removeTour') || 'Remove Tour?',
            t('removeTourWarning') || 'If you go home now, this tour will be removed from your active tours list. Are you sure?',
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('goHome') || 'Go Home', style: 'destructive', onPress: cleanupAndExit }
            ]
        );
    };

    const handleGoBack = () => {
        // If it's a multiplayer tour, we return to the post-tour lobby.
        // If single player, we can just trigger the exit confirmation since there is no lobby.
        if (activeTour?.teams && activeTour.teams.length > 1) {
            router.replace({ pathname: '/tour-waiting-lobby/[id]', params: { id: activeTourId } });
        } else {
            confirmAndExit();
        }
    };

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

        setSubmittingReview(true);
        try {
            await tourService.createReview(activeTour.tourId, {
                rating,
                content,
                photos
            });

            // Force refetch details so the new review appears
            await fetchTourDetails(activeTour.tourId, undefined, true);

            setShowReviewForm(false);

            // Cleanup and Navigate
            await cleanupAndExit();

        } catch (error: any) {
            console.error('Error submitting review:', error);
            Alert.alert(t('error'), t('reviewSubmitError') + (error.message ? `: ${error.message}` : ''));
        } finally {
            setSubmittingReview(false);
        }
    };

    const submitFeedback = async (rating: number, feedback: string) => {
        if (!user || !activeTour?.tourId) return;

        try {
            await feedbackService.submitFeedback({
                tourId: activeTour.tourId,
                userId: user.id,
                rating,
                feedback,
                source: 'TOUR_COMPLETION'
            });
        } catch (error) {
            console.error('Failed to submit feedback', error);
        }
    };


    const handleBackToHome = () => {
        confirmAndExit();
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
        submitFeedback,
        submittingReview,
        handleBackToHome,
        handleGoBack,
        t
    };
};