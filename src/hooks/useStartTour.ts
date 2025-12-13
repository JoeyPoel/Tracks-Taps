import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';

export const useStartTour = (tourId: number) => {
    const { user, refreshUser } = useUserContext();
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);

    const { t } = useLanguage();

    const executeStartTour = async (force: boolean, isLobbyMode: boolean) => {
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
                    userId: user?.id,
                    tourId: tourId,
                    force: force,
                }),
            });

            if (response.status === 409) {
                const { activeTour } = await response.json();

                if (Platform.OS === 'web') {
                    const shouldReplace = window.confirm(
                        t('activeTourExistsMessage')
                    );
                    if (shouldReplace) {
                        await executeStartTour(true, isLobbyMode);
                    }
                } else {
                    Alert.alert(
                        t('activeTourExists'),
                        t('activeTourExistsMessage'),
                        [
                            {
                                text: t('cancel'),
                                style: 'cancel',
                                onPress: () => setIsStarting(false)
                            },
                            {
                                text: t('startNew'),
                                style: 'destructive',
                                onPress: () => executeStartTour(true, isLobbyMode),
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

            // Refresh user tokens to update balance in UI
            refreshUser();

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

    const startTour = async (force = false, isLobbyMode = false) => {
        if (!user) return;

        if (user.tokens < 1) {
            if (Platform.OS === 'web') {
                alert(t('insufficientTokensMessage'));
            } else {
                Alert.alert(t('insufficientTokensTitle'), t('insufficientTokensMessage'));
            }
            return;
        }

        // If explicitly forcing (recursive call), just run it.
        // Actually, the 409 recursive call calls executeStartTour directly, 
        // effectively bypassing this cost check (checked initially) and cost prompt.
        // But if someone called startTour(true) directly manually? Unlikely.

        if (!force) {
            if (Platform.OS === 'web') {
                if (window.confirm(t('startTourCostMessage').replace('{0}', user.tokens.toString()))) {
                    await executeStartTour(force, isLobbyMode);
                }
            } else {
                Alert.alert(
                    t('startTourCostTitle'),
                    t('startTourCostMessage').replace('{0}', user.tokens.toString()),
                    [
                        { text: t('cancel'), style: 'cancel' },
                        { text: t('proceed'), onPress: () => executeStartTour(force, isLobbyMode) }
                    ]
                );
            }
        } else {
            await executeStartTour(force, isLobbyMode);
        }
    };

    return { startTour, isStarting };
};
