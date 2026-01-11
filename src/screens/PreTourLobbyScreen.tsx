import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import InviteFriendsModal from '../components/common/InviteFriendsModal';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TourLoadingScreen } from '../components/common/TourLoadingScreen';
import { TourCodeDisplay } from '../components/teamSetup/TourCodeDisplay';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
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

    const { activeTour, userTeam, loading, loadLobbyDetails, startTour } = usePreTourLobby(activeTourId, user);

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

    if (loading) {
        return <TourLoadingScreen message="Loading lobby..." />;
    }

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} animateEntry={false} includeTop>

            <LobbyHeader onInvitePress={() => setShowInviteModal(true)} />

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
                onStartTour={startTour}
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
