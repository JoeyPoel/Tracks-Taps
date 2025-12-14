import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import client from '../api/client'; // Use configured client
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { authEvents } from '../utils/authEvents';

export type StartTourMode = 'solo' | 'lobby' | null;

export const useStartTour = (tourId: number) => {
    const { user, refreshUser } = useUserContext();
    const router = useRouter();
    const [loadingMode, setLoadingMode] = useState<StartTourMode>(null);

    const { t } = useLanguage();

    const executeStartTour = async (force: boolean, isLobbyMode: boolean) => {
        setLoadingMode(isLobbyMode ? 'lobby' : 'solo');
        try {
            // Using axios client which automatically adds Auth header via interceptor
            const response = await client.post('/active-tours', {
                userId: user?.id,
                tourId: tourId,
                force: force,
            });

            // Axios throws on 4xx/5xx by default unless validatedStatus is changed.
            // But we might need to handle 409 separately if it throws.

            const newActiveTour = response.data;

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

        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 401) {
                    // Handled by client interceptor global modal
                    console.log('401 handled by interceptor');
                } else if (error.response.status === 409) {
                    // Conflict (Active tour exists)
                    if (Platform.OS === 'web') {
                        const shouldReplace = window.confirm(t('activeTourExistsMessage'));
                        if (shouldReplace) {
                            await executeStartTour(true, isLobbyMode);
                        }
                    } else {
                        Alert.alert(
                            t('activeTourExists'),
                            t('activeTourExistsMessage'),
                            [
                                { text: t('cancel'), style: 'cancel', onPress: () => setLoadingMode(null) },
                                { text: t('startNew'), style: 'destructive', onPress: () => executeStartTour(true, isLobbyMode) },
                            ]
                        );
                    }
                    return;
                } else {
                    const errorMsg = error.response.data?.error || 'Failed to start tour';
                    console.error('Server error:', errorMsg);
                    Alert.alert('Error', errorMsg);
                }
            } else {
                console.error('Error starting tour:', error);
                Alert.alert('Error', 'Failed to start tour. Please try again.');
            }
        } finally {
            setLoadingMode(null);
        }
    };

    const startTour = async (force = false, isLobbyMode = false) => {
        if (!user) {
            authEvents.emit();
            return;
        }

        if (user.tokens < 1) {
            if (Platform.OS === 'web') {
                alert(t('insufficientTokensMessage'));
            } else {
                Alert.alert(t('insufficientTokensTitle'), t('insufficientTokensMessage'));
            }
            return;
        }

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

    return { startTour, loadingMode };
};
