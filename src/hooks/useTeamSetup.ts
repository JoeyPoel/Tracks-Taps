import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { activeTourService } from '../services/activeTourService';
import { TEAM_COLORS, TEAM_EMOJIS } from '../utils/teamUtils';

export const useTeamSetup = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const tourId = Number(params.tourId);
    const { user } = useUserContext();
    const { t } = useLanguage();

    const [teamName, setTeamName] = useState('');
    const [selectedColor, setSelectedColor] = useState(TEAM_COLORS[1]);
    const [selectedEmoji, setSelectedEmoji] = useState(TEAM_EMOJIS[0]);
    const [loading, setLoading] = useState(false);

    const handleCreateTeam = async (force = false) => {
        if (!teamName.trim()) {
            Alert.alert(t('missingInfo'), t('enterTeamNameAlert'));
            return;
        }
        if (!user) return;

        setLoading(true);
        try {
            const response = await activeTourService.startTour(
                tourId,
                user.id,
                force,
                teamName,
                selectedColor,
                selectedEmoji
            );

            router.push(`/active-tour/${response.id}`);

        } catch (error: any) {
            if (error.response && error.response.status === 409) {
                const activeTour = error.response.data.activeTour;
                if (Platform.OS === 'web') {
                    const shouldReplace = window.confirm(
                        t('activeTourExistsMessage')
                    );
                    if (shouldReplace) {
                        handleCreateTeam(true); // Retry with force
                    }
                } else {
                    Alert.alert(
                        t('activeTourExists'),
                        t('activeTourExistsMessage'),
                        [
                            { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
                            { text: t('startNew'), style: 'destructive', onPress: () => handleCreateTeam(true) }
                        ]
                    );
                }
                return;
            }

            console.error('Error starting team tour:', error);
            Alert.alert('Error', t('failedToCreateTeam'));
            setLoading(false);
        }
    };

    return {
        teamName,
        setTeamName,
        selectedColor,
        setSelectedColor,
        selectedEmoji,
        setSelectedEmoji,
        loading,
        handleCreateTeam
    };
};
