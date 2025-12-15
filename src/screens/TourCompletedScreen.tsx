import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Confetti from '../components/activeTourScreen/animations/Confetti';
import Podium from '../components/tourCompleted/Podium';
import ReviewForm from '../components/tourCompleted/ReviewForm';
import { useTheme } from '../context/ThemeContext';
import { useTourCompleted } from '../hooks/useTourCompleted';

export default function TourCompletedScreen({ activeTourId, celebrate = false }: { activeTourId: number, celebrate?: boolean }) {
    const { theme } = useTheme();

    // Use custom hook for logic
    const {
        activeTour,
        loading,
        activeTeams,
        winner,
        showReviewForm,
        setShowReviewForm,
        handleCreateReview,
        submittingReview,
        handleBackToHome,
        t
    } = useTourCompleted(activeTourId);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!activeTour) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.textPrimary }}>{t('tourNotFound')}</Text>
            </View>
        );
    }

    const podiumTeams = activeTeams.slice(0, 3);
    const runnerUps = activeTeams.slice(3);
    const winnerName = winner?.name || winner?.user?.name || `Team ${winner?.id}`;

    // Has current user submitted a review?
    // We can infer this if needed, or track it in hook. 
    // Assuming simplistic "submitted" state isn't persisted across reloads without backend flag
    // For now, let's keep the button always available or assume hook handles visibility logic.
    // Ideally user.reviews check would be better.

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            {celebrate && <Confetti />}

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Section */}
                <LinearGradient
                    colors={[theme.secondary, theme.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <Text style={styles.congratsTitle}>{t('tourCompleted')}</Text>
                    <Text style={styles.tourTitle}>{activeTour.tour?.title}</Text>
                </LinearGradient>

                {/* Winner Card */}
                {winner && (
                    <View style={[styles.winnerCard, { backgroundColor: theme.bgSecondary, borderColor: theme.fixedTrophyGold }]}>
                        <View style={styles.trophyIconContainer}>
                            <Ionicons name="trophy-outline" size={60} color={theme.fixedTrophyGold} />
                        </View>
                        <Text style={[styles.winnerTeamName, { color: theme.textPrimary }]}>{winnerName}</Text>

                        <View style={[styles.winnerScoreBadge, { backgroundColor: theme.bgPrimary }]}>
                            <Ionicons name="flash" size={16} color={theme.primary} style={{ marginRight: 4 }} />
                            <Text style={[styles.winnerScoreText, { color: theme.primary }]}>{winner.score} {t('points')}</Text>
                        </View>
                    </View>
                )}

                {/* Podium */}
                {activeTeams.length > 0 && (
                    <Podium teams={podiumTeams} />
                )}

                {/* Runner Ups */}
                {runnerUps.length > 0 && (
                    <View style={styles.leaderboardList}>
                        {runnerUps.map((team, index) => (
                            <View key={team.id} style={[styles.leaderboardItem, { backgroundColor: theme.bgSecondary }]}>
                                <Text style={[styles.rank, { color: theme.textSecondary }]}>{index + 4}</Text>
                                <View style={styles.leaderboardInfo}>
                                    <Text style={[styles.leaderboardName, { color: theme.textPrimary }]}>{team.name || team.user?.name}</Text>
                                </View>
                                <View style={styles.leaderboardScore}>
                                    <Text style={[styles.leaderboardScoreText, { color: theme.success }]}>{team.score}</Text>
                                    <Text style={[styles.leaderboardScoreLabel, { color: theme.textSecondary }]}>{t('pts')}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.writeReviewButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                        onPress={() => setShowReviewForm(true)}
                    >
                        <Ionicons name="star-outline" size={20} color={theme.fixedWhite} style={{ marginRight: 8 }} />
                        <Text style={[styles.writeReviewText, { color: theme.fixedWhite }]}>{t('writeReview')}</Text>
                    </TouchableOpacity>

                    <ReviewForm
                        visible={showReviewForm}
                        onClose={() => setShowReviewForm(false)}
                        onSubmit={handleCreateReview}
                        submitting={submittingReview}
                        tourName={activeTour.tour?.title}
                    />

                    <TouchableOpacity
                        style={[styles.homeButton, { backgroundColor: theme.bgSecondary }]}
                        onPress={handleBackToHome}
                    >
                        <Text style={[styles.homeButtonText, { color: theme.textPrimary }]}>{t('backToHome')}</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    headerGradient: {
        width: '100%',
        paddingTop: 20,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: -30, // Overlap with winner card
        zIndex: 1,
    },
    congratsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 2,
    },
    tourTitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    winnerCard: {
        width: '85%',
        borderRadius: 20,
        borderWidth: 2,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
        zIndex: 2,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    trophyIconContainer: {
        marginBottom: 12,
    },
    winnerTeamName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    winnerScoreBadge: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    winnerScoreText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    leaderboardList: {
        width: '90%',
        marginTop: 16,
        marginBottom: 24,
    },
    leaderboardItem: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    rank: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 30,
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontSize: 16,
        fontWeight: '600',
    },
    leaderboardScore: {
        alignItems: 'flex-end',
    },
    leaderboardScoreText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    leaderboardScoreLabel: {
        fontSize: 10,
    },
    actionsContainer: {
        width: '90%',
        gap: 12,
    },
    writeReviewButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    writeReviewText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    homeButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 12,
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
});
