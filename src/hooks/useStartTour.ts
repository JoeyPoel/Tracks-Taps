import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import client from '../api/client'; // Use configured client
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { authEvents } from '../utils/authEvents';
export const useStartTour = (tourId: number) => {
    const { user, refreshUser } = useUserContext();
    const router = useRouter();
    const [isStarting, setIsStarting] = useState(false);

    const { t } = useLanguage();

    const executeStartTour = async (force: boolean, isLobbyMode: boolean) => {
        setIsStarting(true);
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
                    // However, if we want to be safe or if the interceptor logic is specific:
                    // authEvents.emit(); 
                    // But usually we just let it fall through or suppress the alert if global handles it.
                    // For now, let's just log it to avoid double alerts if the global one fires.
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
                                { text: t('cancel'), style: 'cancel', onPress: () => setIsStarting(false) },
                                { text: t('startNew'), style: 'destructive', onPress: () => executeStartTour(true, isLobbyMode) },
                            ]
                        );
                    }
                    // Return early so we don't hit the generic error block or finally block immediately if recursing (though await usually handles it)
                    // The finally block will run after this function finishes. 
                    // If we recurse, the inner call sets isStarting=true then false.
                    // The outer call will set isStarting=false in finally.
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
            // Only stop loading if we are not recursing (which handles its own state)
            // But with async/await, the recursive call finishes before we get here.
            // So setting false here is correct for the top-level call.
            setIsStarting(false);
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
