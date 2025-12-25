import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TeamCard } from '../components/teamSetup/TeamCard';
import { TourCodeDisplay } from '../components/teamSetup/TourCodeDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';

import InviteFriendsModal from '../components/common/InviteFriendsModal';
import { usePreTourLobby } from '../hooks/usePreTourLobby';

export default function PreTourLobbyScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useUserContext();
    const activeTourId = Number(params.activeTourId);
    const [showInviteModal, setShowInviteModal] = React.useState(false);

    const { activeTour, userTeam, loadLobbyDetails } = usePreTourLobby(activeTourId, user);

    useFocusEffect(
        useCallback(() => {
            if (activeTourId && user) {
                loadLobbyDetails();
            }
        }, [activeTourId, user, loadLobbyDetails])
    );

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} animateEntry={false}>
            <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
                <AnimatedPressable
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.closeButton}
                    interactionScale="subtle"
                >
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </AnimatedPressable>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Lobby</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="people-circle-outline" size={80} color={theme.primary} />
                    <Text style={[styles.title, { color: theme.textPrimary }]}>{t('marketingLobbyTitle') || "You're in!"}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('marketingLobbySubtitle') || "Wait for your team or start setup."}</Text>
                </View>

                {activeTourId && (
                    <TourCodeDisplay code={activeTourId.toString()} />
                )}

                {userTeam && userTeam.name && (
                    <TeamCard
                        name={userTeam.name}
                        color={userTeam.color}
                        emoji={userTeam.emoji}
                    />
                )}

                <View style={{ flex: 1 }} />

                <AnimatedButton
                    title={t('inviteFriends') || "Invite Friends"}
                    onPress={() => setShowInviteModal(true)}
                    icon="person-add"
                    variant="secondary"
                    style={{ marginBottom: 16 }}
                />

                <AnimatedButton
                    title={(userTeam && userTeam.name) ? (t('editTeam') || "Edit Team") : (t('setupTeam') || "Setup Team")}
                    onPress={() => router.push({
                        pathname: '/team-setup',
                        params: {
                            activeTourId,
                            mode: 'update',
                            currentName: userTeam?.name,
                            currentColor: userTeam?.color,
                            currentEmoji: userTeam?.emoji
                        }
                    })}
                    icon="pencil"
                    variant="primary"
                    style={{ marginBottom: 16 }}
                />

                <AnimatedButton
                    title={t('startTour')}
                    onPress={() => router.push(`/active-tour/${activeTourId}`)}
                    disabled={!userTeam || !userTeam.name}
                    icon="play"
                    variant="secondary"
                    style={{ opacity: (!userTeam || !userTeam.name) ? 0.5 : 1 }}
                />
            </View>

            <InviteFriendsModal
                visible={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                activeTourId={activeTourId}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    closeButton: {},
    content: { padding: 24, flex: 1 },
    iconContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, marginTop: 16 },
    subtitle: { fontSize: 16, textAlign: 'center' },
    // actionButton/Text styles removed as they are handled by AnimatedButton
});
