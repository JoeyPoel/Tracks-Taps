import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedButton } from '../components/common/AnimatedButton';
import AppHeader from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useWaitingLobby } from '../hooks/useWaitingLobby';

export default function PostTourLobbyScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();

    const {
        teams,
        userTeam,
        finishedCount,
        totalTeamCount,
        progressPercentage,
        handleViewResults
    } = useWaitingLobby(activeTourId);

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <AppHeader title={"Lobby"} showBackButton={true} onBackPress={() => router.replace('/')} />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <LinearGradient
                    colors={[theme.secondary, theme.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <Text style={[styles.headerTitle, { color: theme.fixedWhite }]}>{t('greatJobTitle')}</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.fixedWhite }]}>{t('waitingForTeams')}</Text>
                </LinearGradient>



                <View style={styles.mainContent}>
                    {/* Progress Section */}
                    <View style={styles.progressContainer}>
                        <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>{t('tourProgress')}</Text>
                        <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                            {t('teamsCompleted').replace('{0}', finishedCount.toString()).replace('{1}', totalTeamCount.toString())}
                        </Text>

                        <View style={[styles.progressBarBackground, { backgroundColor: theme.bgSecondary }]}>
                            <LinearGradient
                                colors={[theme.secondary, theme.primary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                            />
                        </View>
                    </View>

                    {/* Team List */}
                    <View style={styles.teamList}>
                        {teams.filter(team => team.id !== userTeam?.id).map((team) => {
                            const isFinished = !!team.finishedAt;
                            const statusColor = team.color;

                            return (
                                <View key={team.id} style={[styles.teamCard, { backgroundColor: theme.bgSecondary }]}>
                                    <View style={styles.statusIconContainer}>
                                        {isFinished ? (
                                            <View style={[styles.statusIconCircle, { backgroundColor: statusColor + '33' }]}>
                                                <Ionicons name="checkmark" size={16} color={statusColor} />
                                            </View>
                                        ) : (
                                            <View style={[styles.statusIconCircle, { backgroundColor: statusColor + '33' }]}>
                                                <ActivityIndicator size="small" color={statusColor} />
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.teamInfo}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.teamEmoji}>{team.emoji}</Text>
                                            <Text style={[styles.teamName, { color: theme.textPrimary }]}>{team.name}</Text>
                                        </View>
                                        <Text style={[styles.teamStatusText, { color: isFinished ? statusColor : theme.textSecondary }]}>
                                            {isFinished ? t('finished') : t('inProgress')}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {/* Footer / Your Team Section (Moved inside ScrollView) */}
                    <View style={[styles.footerContainer, { backgroundColor: 'transparent', borderTopWidth: 0 }]}>
                        <View style={styles.yourTeamSection}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <Ionicons name="sparkles" size={16} color={theme.gold} style={{ marginRight: 8 }} />
                                <Text style={[styles.yourTeamLabel, { color: theme.textPrimary }]}>{t('yourTeam')}</Text>
                            </View>

                            <View style={[styles.yourTeamCard, { backgroundColor: theme.bgSecondary, borderColor: theme.borderSecondary }]}>
                                {userTeam && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={[styles.avatar, { backgroundColor: userTeam.color }]}>
                                            <Text style={{ fontSize: 20 }}>{userTeam.emoji}</Text>
                                        </View>
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[styles.yourTeamName, { color: theme.textPrimary }]}>{userTeam.name}</Text>
                                            <Text style={[styles.yourTeamMembers, { color: theme.success }]}>{t('finished')}!</Text>
                                        </View>
                                    </View>
                                )}
                                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                            </View>
                        </View>

                        <AnimatedButton
                            title={t('viewResults')}
                            onPress={handleViewResults}
                            icon="chevron-forward"
                            variant="primary"
                            style={styles.viewResultsButton}
                        />

                        <Text style={[styles.autoRedirectText, { color: theme.textSecondary }]}>
                            {t('autoResults')}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    headerGradient: {
        width: '100%',
        paddingTop: 20,
        paddingBottom: 15,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.8,
    },
    scrollContent: {
        paddingTop: 0,
        paddingHorizontal: 0,
        paddingBottom: 40,
    },
    mainContent: {
        paddingTop: 24,
        paddingHorizontal: 20,
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    progressSubtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    progressBarBackground: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    teamList: {
        gap: 12,
        marginBottom: 32, // Added margin to separate from footer
    },
    teamCard: {
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIconContainer: {
        marginRight: 16,
    },
    statusIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamInfo: {
        flex: 1,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
    },
    teamEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    teamStatusText: {
        fontSize: 12,
    },
    membersCount: {
        fontSize: 12,
    },
    footerContainer: {
        // Removed absolute positioning
        width: '100%',
        paddingVertical: 10,
    },
    yourTeamSection: {
        marginBottom: 20,
    },
    yourTeamLabel: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    yourTeamCard: {
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    yourTeamName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    yourTeamMembers: {
        fontSize: 12,
    },
    viewResultsButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 12,
    },
    buttonGradient: {
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
    autoRedirectText: {
        fontSize: 12,
        textAlign: 'center',
    },
});
