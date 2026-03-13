import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import InviteFriendsModal from '../components/common/InviteFriendsModal';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TourLoadingScreen } from '../components/common/TourLoadingScreen';
import { TourCodeDisplay } from '../components/teamSetup/TourCodeDisplay';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useFriends } from '../hooks/useFriends';
import { usePreTourLobby } from '../hooks/usePreTourLobby';

// New Components
import { LobbyFooter } from '../components/preTourLobby/LobbyFooter';
import { LobbyHeader } from '../components/preTourLobby/LobbyHeader';
import { LobbyMyTeam } from '../components/preTourLobby/LobbyMyTeam';
import { LobbyPlayerList } from '../components/preTourLobby/LobbyPlayerList';
import { LobbyTourInfo } from '../components/preTourLobby/LobbyTourInfo';

export default function PreTourLobbyScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useUserContext();
    const activeTourId = Number(params.activeTourId);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [isInviteLoading, setIsInviteLoading] = useState(false);
    const { loadFriends } = useFriends();

    const { activeTour, userTeam, loading, isStarting, loadLobbyDetails, startTour } = usePreTourLobby(activeTourId, user);

    const handleInvitePress = async () => {
        setIsInviteLoading(true);
        try {
            await loadFriends(true); // Always fetch fresh friends for inviting
            setShowInviteModal(true);
        } catch (error) {
            console.error('Failed to load friends for invite:', error);
            Alert.alert('Error', 'Failed to load friends. Please try again.');
        } finally {
            setIsInviteLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (activeTourId && user) {
                loadLobbyDetails();
            }
        }, [activeTourId, user, loadLobbyDetails])
    );

    // Auto-redirect when tour starts
    React.useEffect(() => {
        if (activeTour?.status === 'IN_PROGRESS') {
            router.replace(`/active-tour/${activeTourId}`);
        }
    }, [activeTour?.status, activeTourId]);

    if (isStarting) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={true} animateEntry={false}>
                <TourLoadingScreen message="Loading Tour..." />
            </ScreenWrapper>
        );
    }

    if (loading && !activeTour) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={true} animateEntry={false}>
                <TourLoadingScreen message="Loading lobby..." />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} animateEntry={false} includeTop>

            <LobbyHeader onInvitePress={handleInvitePress} isInviteLoading={isInviteLoading} />

            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

                <LobbyTourInfo activeTour={activeTour} />

                {/* Game Code Section */}
                <Animated.View entering={FadeInUp.delay(200).springify()} style={{ marginBottom: 16 }}>
                    <TourCodeDisplay code={activeTourId.toString()} />
                </Animated.View>

                <LobbyMyTeam
                    userTeam={userTeam}
                    activeTourId={activeTourId}
                />

                <LobbyPlayerList
                    activeTour={activeTour}
                    currentUserId={user?.id || 0}
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            <LobbyFooter
                activeTour={activeTour}
                user={user}
                userTeam={userTeam}
                onStartTour={async () => {
                    const start = async () => {
                        const result: any = await startTour();
                        if (result && !result.success) {
                            Alert.alert('Error', result.error);
                        }
                    };

                    const tourData = activeTour?.tour;
                    const isPubGolf = tourData?.modes?.some((m: string) => m.toLowerCase() === 'pubgolf') || tourData?.genre?.toLowerCase() === 'pubgolf';
                    if (isPubGolf) {
                        Alert.alert(
                            "Age Restriction & Disclaimer",
                            "This game mode involves locations that serve alcohol. You must be of legal drinking age (18+ in most regions) to play this mode. Tracks & Taps is not responsible for inappropriate alcohol usage. Do you agree and confirm you meet the age requirement?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "I Confirm (18+)", onPress: start }
                            ]
                        );
                    } else {
                        start();
                    }
                }}
                activeTourId={activeTourId}
            />

            <InviteFriendsModal
                visible={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                activeTourId={activeTourId}
            />
        </ScreenWrapper>
    );
}
