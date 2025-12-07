import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useUserContext } from '../context/UserContext';
import { activeTourService } from '../services/activeTourService';
import { useStore } from '../store/store';
import { TEAM_COLORS, TEAM_EMOJIS } from '../utils/teamUtils';

export const useTeamSetup = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const activeTourId = params.activeTourId ? Number(params.activeTourId) : null;

    const { user } = useUserContext();
    const { t } = useLanguage();
    const fetchActiveTours = useStore((state) => state.fetchActiveTours);

    const [teamName, setTeamName] = useState(params.currentName as string || '');
    const [selectedColor, setSelectedColor] = useState(params.currentColor as string || TEAM_COLORS[0]); // Default Red
    const [selectedEmoji, setSelectedEmoji] = useState(params.currentEmoji as string || TEAM_EMOJIS[0]); // Default Fire
    const [loading, setLoading] = useState(false);

    // Load existing team details if editing
    useEffect(() => {
        const loadTeamDetails = async () => {
            if (activeTourId && user) {
                try {
                    const tour = await activeTourService.getActiveTourById(activeTourId);
                    if (tour && tour.teams) {
                        const existingTeam = tour.teams.find((t: any) => t.userId === user.id);
                        if (existingTeam) {
                            if (existingTeam.name) setTeamName(existingTeam.name);
                            if (existingTeam.color) setSelectedColor(existingTeam.color);
                            if (existingTeam.emoji) setSelectedEmoji(existingTeam.emoji);
                        }
                    }
                } catch (error) {
                    console.error('Error loading team details:', error);
                }
            }
        };
        loadTeamDetails();
    }, [activeTourId, user]);

    const handleCreateTeam = async (force = false) => {
        if (!teamName.trim()) {
            Alert.alert(t('missingInfo'), t('enterTeamNameAlert'));
            return;
        }
        if (!user || !activeTourId) return;

        setLoading(true);
        try {
            await activeTourService.updateTeamDetails(
                activeTourId,
                user.id,
                teamName,
                selectedColor,
                selectedEmoji
            );

            await fetchActiveTours(user.id);

            router.push({
                pathname: '/lobby',
                params: { activeTourId: activeTourId }
            });

        } catch (error: any) {
            console.error('Error in team setup:', error);
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
