import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useUserContext } from '../context/UserContext';

export const useStartTour = (tourId: number) => {
    const { user } = useUserContext();
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);

    const startTour = async (force = false, isLobbyMode = false) => {
        if (!user) return;

        setIsStarting(true);
        try {
            // Note: We are communicating directly with the API here as per the original component code.
            //Ideally this might move to the store, but for now we extraction logic.
            const response = await fetch('/api/active-tours', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    tourId: tourId,
                    force: force,
                }),
            });

            if (response.status === 409) {
                const { activeTour } = await response.json();

                if (Platform.OS === 'web') {
                    const shouldReplace = window.confirm(
                        `You have an active tour: "${activeTour.tour.title}". Starting a new one will cause you to lose progress. Do you want to proceed?`
                    );
                    if (shouldReplace) {
                        await startTour(true, isLobbyMode);
                    }
                } else {
                    Alert.alert(
                        'Active Tour Exists',
                        `You have an active tour: "${activeTour.tour.title}". Starting a new one will cause you to lose progress. Do you want to proceed?`,
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => setIsStarting(false)
                            },
                            {
                                text: 'Start New Tour',
                                style: 'destructive',
                                onPress: () => startTour(true, isLobbyMode),
                            },
                        ]
                    );
                }
                setIsStarting(false);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'Failed to start tour');
            }

            const newActiveTour = await response.json();

            if (isLobbyMode) {
                router.push({
                    pathname: '/lobby',
                    params: { activeTourId: newActiveTour.id }
                });
            } else {
                router.push(`/active-tour/${newActiveTour.id}`);
            }

        } catch (error) {
            console.error('Error starting tour:', error);
            if (Platform.OS === 'web') {
                alert('Failed to start tour. Please try again.');
            } else {
                Alert.alert('Error', 'Failed to start tour. Please try again.');
            }
        } finally {
            setIsStarting(false);
        }
    };

    return { startTour, isStarting };
};
