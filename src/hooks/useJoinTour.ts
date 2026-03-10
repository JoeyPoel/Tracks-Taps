import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { activeTourService } from '../services/activeTourService';

export const useJoinTour = () => {
    const router = useRouter();
    const { user } = useUserContext();
    const { t } = useLanguage();

    const [tourCode, setTourCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        if (isNaN(Number(activeTourId))) {
            setError(t('invalidTourCode'));
            return;
        }

        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await activeTourService.joinActiveTour(
                Number(activeTourId),
                user.id
            );

            // Handle custom 200 error response to prevent console error logs
            if (response && response.success === false && response.error === 'invalidTourCode') {
                setError(t('invalidTourCode'));
                return;
            }

            // Navigate to Lobby
            router.push({
                pathname: '/lobby',
                params: { activeTourId: activeTourId }
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
