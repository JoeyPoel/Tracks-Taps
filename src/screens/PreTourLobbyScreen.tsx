import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TeamCard } from '../components/teamSetup/TeamCard';
import { TourCodeDisplay } from '../components/teamSetup/TourCodeDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';

import { activeTourService } from '../services/activeTourService';

export default function PreTourLobbyScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useUserContext();
    const activeTourId = Number(params.activeTourId);

    const [activeTour, setActiveTour] = React.useState<any>(null);
    const [userTeam, setUserTeam] = React.useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            if (activeTourId && user) {
                loadLobbyDetails();
            }
        }, [activeTourId, user])
    );

    const loadLobbyDetails = async () => {
        try {
            const tour = await activeTourService.getActiveTourById(activeTourId);
            setActiveTour(tour);

            if (tour && tour.teams) {
                const team = tour.teams.find((t: any) => t.userId === user?.id);
                setUserTeam(team);
            }
        } catch (error) {
            console.error('Failed to load lobby details', error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <View style={[styles.header, { borderBottomColor: theme.borderPrimary }]}>
                <TouchableOpacity
                    onPress={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/');
                        }
                    }}
                    style={styles.closeButton}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
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

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
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
                >
                    <Text style={styles.actionButtonText}>{(userTeam && userTeam.name) ? (t('editTeam') || "Edit Team") : (t('setupTeam') || "Setup Team")}</Text>
                    <Ionicons name="pencil" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.secondary, marginTop: 12 }]}
                    onPress={() => router.push(`/active-tour/${activeTourId}`)}
                >
                    <Text style={styles.actionButtonText}>{t('startTour')}</Text>
                    <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
    actionButton: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    actionButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
