
import { useLanguage } from '@/src/context/LanguageContext';
import { tourService } from '@/src/services/tourService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { TourDraft } from './useTourDraft';

export function useTourSubmission(user: any) {
    const { t } = useLanguage();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                distance: parseFloat(tourDraft.distance) || 0,
                duration: parseInt(tourDraft.duration) || 0,
                authorId: parseInt(user.id) || 0,
                points: Math.round(tourDraft.points),
                challenges: [],
                startLat: tourDraft.startLat,
                startLng: tourDraft.startLng,
            };

            await tourService.createTour(payload);

            Alert.alert(t('tourCreatedSuccess'), t('playForFree'), [
                { text: 'OK', onPress: () => router.replace('/(tabs)/profile') }
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
