import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Changed SAFE to ScrollView for potential list
import { SafeAreaView } from 'react-native-safe-area-context';
import { TeamCard } from '../components/teamSetup/TeamCard';
import { TourCodeDisplay } from '../components/teamSetup/TourCodeDisplay';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useWaitingLobby } from '../hooks/useWaitingLobby';

export default function PreTourLobbyScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const params = useLocalSearchParams();
    const activeTourId = Number(params.activeTourId);

    // Reuse the hook to get teams and real-time updates!
    const { teams, userTeam } = useWaitingLobby(activeTourId);

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
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Game Lobby</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="people-circle-outline" size={80} color={theme.primary} />
                    <Text style={[styles.title, { color: theme.textPrimary }]}>{t('marketingLobbyTitle') || "You're in!"}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t('marketingLobbySubtitle') || "Wait for your team or start setup."}</Text>
                </View>

                {activeTourId && (
                    <TourCodeDisplay code={activeTourId.toString()} />
                )}

                {/* Your Team */}
                {userTeam && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Team</Text>
                        <TeamCard
                            name={userTeam.name}
                            color={userTeam.color}
                            emoji={userTeam.emoji}
                        />
                        <TouchableOpacity
                            style={[styles.editButton, { borderColor: theme.borderPrimary }]}
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
                            <Text style={[styles.editButtonText, { color: theme.textPrimary }]}>Edit Team</Text>
                            <Ionicons name="pencil" size={16} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Other Teams */}
                {teams && teams.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>All Teams ({teams.length})</Text>
                        <View style={{ gap: 12 }}>
                            {teams.map(team => (
                                <View key={team.id} style={[styles.miniTeamCard, { backgroundColor: theme.bgSecondary }]}>
                                    <Text style={{ fontSize: 20, marginRight: 12 }}>{team.emoji}</Text>
                                    <View>
                                        <Text style={[styles.miniTeamName, { color: theme.textPrimary }]}>{team.name}</Text>
                                        {team.id === userTeam?.id && <Text style={{ fontSize: 10, color: theme.primary }}> (You)</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.secondary, marginBottom: 40 }]}
                    onPress={() => router.push(`/active-tour/${activeTourId}`)}
                >
                    <Text style={styles.actionButtonText}>{t('startTour')}</Text>
                    <Ionicons name="play" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </ScrollView>
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
    iconContainer: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
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
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
    editButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 8,
        alignSelf: 'flex-start'
    },
    editButtonText: { marginRight: 8, fontSize: 14, fontWeight: '600' },
    miniTeamCard: {
        padding: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    miniTeamName: { fontWeight: '600' }
});
