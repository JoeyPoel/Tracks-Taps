import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { activeTourService } from '../services/activeTourService';
import { useStore } from '../store/store';

export const useJoinTour = () => {
    const router = useRouter();
    const { user } = useUserContext();
    const { t } = useLanguage();

    const [tourCode, setTourCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { activeTours, abandonTour } = useStore();

    const handleJoinTour = async () => {
        if (!tourCode.trim()) {
            setError(t('enterTourCode'));
            return;
        }

        let activeTourId = tourCode.replace(/\s/g, '');
        // Remove optional "TOUR-" prefix if present
        if (activeTourId.toUpperCase().startsWith('TOUR-')) {
            activeTourId = activeTourId.substring(5);
        }

        const numericTourId = Number(activeTourId);
        if (isNaN(numericTourId)) {
            setError(t('invalidTourCode'));
            return;
        }

        if (!user) return;

        // Check for existing active tours
        const existingTour = activeTours.length > 0 ? activeTours[0] : null;

        if (existingTour) {
            // Already in this exact tour session
            if (existingTour.id === numericTourId) {
                // Let them through immediately
                joinTourProceed(numericTourId);
                return;
            }

            // In a different tour session
            Alert.alert(
                t('existingTourFound') || 'Active Tour Found',
                t('existingTourWarning') || 'You are already in an active tour. Do you want to quit it to join this new one?',
                [
                    { text: t('cancel') || 'Cancel', style: 'cancel' },
                    {
                        text: t('quitAndJoin') || 'Quit & Join', style: 'destructive', onPress: async () => {
                            setLoading(true);
                            try {
                                await abandonTour(existingTour.id, user.id);
                                await joinTourProceed(numericTourId);
                            } catch (e) {
                                console.error('Error abandoning tour:', e);
                                setError(t('failedToQuitTour') || 'Failed to quit current tour.');
                                setLoading(false);
                            }
                        }
                    }
                ]
            );
            return;
        }

        // No existing tour, just join
        await joinTourProceed(numericTourId);
    };

    const joinTourProceed = async (activeTourId: number) => {
        setLoading(true);
        setError(null);

        try {
            const response = await activeTourService.joinActiveTour(
                activeTourId,
                user!.id
            );

            // Handle custom 200 error response to prevent console error logs
            if (response && response.success === false && response.error === 'invalidTourCode') {
                setError(t('invalidTourCode'));
                return;
            }

            // Navigate to Lobby
            router.push({
                pathname: '/lobby',
                params: { activeTourId: activeTourId.toString() }
            });

        } catch (err: any) {
            console.error(err);
            setError(t('failedToJoin'));
        } finally {
            setLoading(false);
        }
    };

    return {
        tourCode,
        setTourCode,
        loading,
        error,
        setError,
        handleJoinTour
    };
};
