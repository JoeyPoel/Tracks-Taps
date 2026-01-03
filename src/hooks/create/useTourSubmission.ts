
import { useLanguage } from '@/src/context/LanguageContext';
import { useToast } from '@/src/context/ToastContext';
import { useAchievements } from '@/src/hooks/useAchievements';
import { tourService } from '@/src/services/tourService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { TourDraft } from './useTourDraft';

export function useTourSubmission(user: any) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { unlockAchievement } = useAchievements();
    const { showToast } = useToast();

    const submitTour = async (tourDraft: TourDraft) => {
        if (!user) {
            Alert.alert(t('error'), t('mustBeLoggedIn'));
            return;
        }

        setIsSubmitting(true);
        try {
            // Sanitize stops
            const sanitizedStops = tourDraft.stops.map((stop, index) => ({
                ...stop,
                number: index + 1,
                challenges: stop.challenges?.map((c: any) => ({
                    ...c,
                    points: parseInt(c.points) || 0
                })) || []
            }));

            const payload = {
                ...tourDraft,
                stops: sanitizedStops,
                points: Math.round(tourDraft.points),
                distance: parseFloat(tourDraft.distance) || 0,
                duration: parseInt(tourDraft.duration) || 0,
                authorId: parseInt(user.id) || 0,


                challenges: [
                    ...tourDraft.challenges, // Bonus challenges
                    ...tourDraft.bingoChallenges.map(bc => ({
                        ...bc,
                        bingoRow: bc.row, // Ensure mapping matches schema
                        bingoCol: bc.col,
                        points: 0, // Bingo challenges might not have individual points? Or use default?
                        type: bc.type || 'LOCATION' // Fallback
                    }))
                ],
                startLat: tourDraft.startLat,
                startLng: tourDraft.startLng,
            };

            const createdTour = await tourService.createTour(payload);

            // Unlock Achievement: Creator
            const achievement = await unlockAchievement('creator');
            if (achievement) {
                showToast({
                    title: achievement.title,
                    message: achievement.description,
                    emoji: '🎨',
                    backgroundColor: achievement.color
                });
            }

            Alert.alert(t('tourCreatedSuccess'), t('playForFree'), [
                {
                    text: 'OK',
                    onPress: () => router.replace({
                        pathname: '/tour/[id]',
                        params: { id: createdTour.id }
                    })
                }
            ]);

        } catch (error: any) {
            console.error("Tour creation error:", error);
            let msg = error.message;
            if (msg.includes('Network request failed')) {
                msg = "Network error. Please check your connection and try again.";
            }
            Alert.alert(t('error'), msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { isSubmitting, submitTour };
}
