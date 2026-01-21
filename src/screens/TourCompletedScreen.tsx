import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from 'expo-store-review';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Added import
import Confetti from '../components/active-tour/animations/Confetti';
import { AnimatedButton } from '../components/common/AnimatedButton';
import FeedbackCard from '../components/tourCompleted/FeedbackCard';
import Podium from '../components/tourCompleted/Podium';
import ReviewForm from '../components/tourCompleted/ReviewForm';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useAchievements } from '../hooks/useAchievements';
import { useTourCompleted } from '../hooks/useTourCompleted';

type RevealState = 'CALCULATING' | 'REVEAL_3' | 'REVEAL_2' | 'REVEAL_1' | 'CELEBRATE';

export default function TourCompletedScreen({ activeTourId, celebrate = false }: { activeTourId: number; celebrate?: boolean }) {
    const { theme } = useTheme();
    const { top } = useSafeAreaInsets(); // Get safe area
    const { unlockAchievement, loadAchievements } = useAchievements();
    const { showToast } = useToast();

    // Use custom hook for logic
    const {
        activeTour,
        loading,
        activeTeams,
        winner,
        showReviewForm,
        setShowReviewForm,
        handleCreateReview,

        submitFeedback, // extracted from hook
        submittingReview,
        handleBackToHome,
        t
    } = useTourCompleted(activeTourId);

    const [revealState, setRevealState] = useState<RevealState>('CALCULATING');
    const [rating, setRating] = useState(0); // For the "Rate App" interaction
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const sequenceHasRun = React.useRef(false);

    useEffect(() => {
        // Reset feedback state when activeTourId changes
        setRating(0);
        setShowFeedbackInput(false);
        setFeedbackText('');
        setFeedbackSubmitted(false);
        setRevealState('CALCULATING');
        sequenceHasRun.current = false;
    }, [activeTourId]);

    useEffect(() => {
        if (!loading && activeTeams.length > 0 && !sequenceHasRun.current) {
            sequenceHasRun.current = true;
            // Start the reveal sequence
            const sequence = async () => {
                // Wait a bit for "calculating" suspense
                await new Promise(r => setTimeout(r, 1500));

                if (activeTeams.length >= 3) {
                    setRevealState('REVEAL_3');
                    await new Promise(r => setTimeout(r, 1000));
                }

                if (activeTeams.length >= 2) {
                    setRevealState('REVEAL_2');
                    await new Promise(r => setTimeout(r, 1000));
                }

                setRevealState('REVEAL_1');
                await new Promise(r => setTimeout(r, 800));
                setRevealState('CELEBRATE');

                // Reload Achievements to check for ANY newly unlocked ones
                // The backend checks for tour completion, friend counts, etc. during finishTour
                const latestAchievements = await loadAchievements();  // Ensure loadAchievements returns data in hook!

                if (latestAchievements && latestAchievements.length > 0) {
                    const now = new Date();
                    const FIVE_MINUTES = 5 * 60 * 1000;

                    const recent = latestAchievements.filter((ach: any) => {
                        if (!ach.unlockedAt) return false;
                        const unlockedDate = new Date(ach.unlockedAt);
                        return (now.getTime() - unlockedDate.getTime()) < FIVE_MINUTES;
                    });

                    // Toast each new achievement
                    recent.forEach((ach: any, index: number) => {
                        setTimeout(() => {
                            showToast({
                                title: ach.title,
                                message: ach.description,
                                emoji: ach.emoji || ach.icon || '🏆', // Fallback icon if emoji missing
                                backgroundColor: ach.color || theme.primary
                            });
                        }, index * 3500); // Stagger toasts if multiple
                    });
                }
            };
            sequence();
        }
    }, [loading, activeTeams, loadAchievements]); // Removed activeTeams dep from sequence start to avoid re-triggering? NO, actually we want to trigger ONLY if loading done.
    // Ideally we'd separate the reset logic from the animation logic.


    const handleRating = async (selectedRating: number) => {
        setRating(selectedRating);
        if (selectedRating >= 4) {
            setShowFeedbackInput(false);
            const isAvailable = await StoreReview.hasAction();
            if (isAvailable) {
                StoreReview.requestReview();
            }
        } else {
            setShowFeedbackInput(true);
        }
    };

    const handleSubmitFeedback = () => {
        submitFeedback(rating, feedbackText);
        setFeedbackSubmitted(true);
        setTimeout(() => {
            setShowFeedbackInput(false);
        }, 2000);
    };

    if (loading || revealState === 'CALCULATING') {
        const message = loading ? t('loading') : t('calculatingResults');
        return (
            <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 20 }} />
                    <TextComponent style={styles.calculatingText} color={theme.textSecondary} variant="body" center>{message}</TextComponent>
                </View>
            </View>
        );
    }

    if (!activeTour) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
                <TextComponent color={theme.textPrimary} variant="body">{t('tourNotFound')}</TextComponent>
            </View>
        );
    }

    const podiumTeams = activeTeams.slice(0, 3);
    const runnerUps = activeTeams.slice(3);
    const winnerName = winner?.name || winner?.user?.name || t('you');

    // Determine which ranks to show based on state
    const getVisibleRanks = () => {
        switch (revealState) {
            case 'REVEAL_3': return [3];
            case 'REVEAL_2': return [3, 2];
            case 'REVEAL_1': return [3, 2, 1];
            case 'CELEBRATE': return [3, 2, 1];
            default: return [];
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            {/* Subtle Gradient Background - Top Fade Only */}
            {/* Top Image with Fade or Fallback Gradient */}
            <View style={styles.headerImageContainer}>
                {activeTour.tour?.imageUrl ? (
                    <View style={styles.headerImage}>
                        <Image
                            source={{ uri: getOptimizedImageUrl(activeTour.tour?.imageUrl, 800) }}
                            style={StyleSheet.absoluteFill}
                            contentFit="cover"
                            cachePolicy="disk"
                            transition={500}
                        />
                        <LinearGradient
                            colors={['transparent', theme.bgPrimary]}
                            style={styles.gradientOverlay}
                            start={{ x: 0.5, y: 0.3 }}
                            end={{ x: 0.5, y: 1 }}
                        />
                    </View>
                ) : (
                    <LinearGradient
                        colors={[theme.secondary, theme.primary]}
                        style={styles.headerImage}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <LinearGradient
                            colors={['transparent', theme.bgPrimary]}
                            style={styles.gradientOverlay}
                            start={{ x: 0.5, y: 0.3 }}
                            end={{ x: 0.5, y: 1 }}
                        />
                    </LinearGradient>
                )}
            </View>

            {/* Confetti floats on top */}
            {revealState === 'CELEBRATE' && <Confetti />}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button (Floating) */}
                <View style={[styles.topBar, { paddingTop: Math.max(top, 20) + 10 }]}>
                    <TouchableOpacity
                        onPress={handleBackToHome}
                        style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <TextComponent style={styles.activeTourTitle} color="#FFFFFF" bold variant="caption">{activeTour?.tour?.title}</TextComponent>

                    {/* Horizontal spacer for balance */}
                    <View style={{ width: 40 }} />
                </View>

                {/* Hero Section: Winner & Podium */}
                <View style={styles.heroSection}>
                    <View style={styles.winnerHeaderContainer}>
                        {revealState === 'CELEBRATE' && (
                            <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.winnerHeader}>
                                <TextComponent style={styles.winnerText} color="#FFFFFF" bold variant="h1" center>
                                    <TextComponent style={{ fontSize: 18, opacity: 0.9 }} color="#FFFFFF" variant="body">{t('winner')} </TextComponent>
                                    {winnerName}
                                </TextComponent>
                                <View style={[styles.winnerScorePill, { backgroundColor: theme.bgPrimary }]}>
                                    <Ionicons name="flash" size={12} color={theme.primary} />
                                    <TextComponent style={styles.winnerScoreText} color={theme.primary} bold variant="caption">
                                        {winner?.score || 0} PTS
                                    </TextComponent>
                                </View>
                            </Animated.View>
                        )}
                    </View>

                    <View style={styles.podiumContainer}>
                        {activeTeams.length > 0 && (
                            <Podium teams={podiumTeams} visibleRanks={getVisibleRanks()} />
                        )}
                    </View>
                </View>

                {/* Content below gradient (Runner ups, Rating, Actions) */}
                <View style={styles.lowerContent}>

                    {/* Rate App Card (Uber Style) */}
                    {revealState === 'CELEBRATE' && (
                        <FeedbackCard
                            rating={rating}
                            onRate={handleRating}
                            feedback={feedbackText}
                            onFeedbackChange={setFeedbackText}
                            onSubmit={handleSubmitFeedback}
                            submitted={feedbackSubmitted}
                            showInput={showFeedbackInput && !feedbackSubmitted}
                        />
                    )}

                    {/* Runner Ups List - Minimal Clean Design */}
                    {revealState === 'CELEBRATE' && runnerUps.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.runnerUpSection}>
                            <TextComponent style={styles.sectionTitle} color={theme.textSecondary} bold variant="caption">{t('leaderboard')}</TextComponent>
                            {runnerUps.map((team, index) => (
                                <View key={team.id} style={[styles.runnerUpRow, { borderColor: theme.borderPrimary }]}>
                                    <TextComponent style={styles.runnerUpRank} color={theme.textSecondary} bold variant="body">{index + 4}</TextComponent>
                                    <TextComponent style={styles.runnerUpName} color={theme.textPrimary} bold variant="body">{team.name || team.user?.name}</TextComponent>
                                    <TextComponent style={styles.runnerUpScore} color={theme.textPrimary} bold variant="body">{team.score} pts</TextComponent>
                                </View>
                            ))}
                        </Animated.View>
                    )}

                    {/* Actions Footer */}
                    {revealState === 'CELEBRATE' && (
                        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footerActions}>
                            <AnimatedButton
                                title={t('writeReview')}
                                onPress={() => setShowReviewForm(true)}
                                variant="primary"
                                style={styles.actionBtn}
                            />

                            <AnimatedButton
                                title={t('backToHome')}
                                onPress={handleBackToHome}
                                variant="outline"
                                style={{ marginTop: 8 }}
                            />
                        </Animated.View>
                    )}
                </View>

                <ReviewForm
                    visible={showReviewForm}
                    onClose={() => setShowReviewForm(false)}
                    onSubmit={handleCreateReview}
                    submitting={submittingReview}
                    tourName={activeTour.tour?.title}
                />

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calculatingText: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60, // Safe area
        paddingBottom: 10,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTourTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    heroSection: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    winnerHeaderContainer: {
        minHeight: 100, // Reserve height for the winner text so it pops in without shifting too much
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    winnerHeader: {
        alignItems: 'center',
    },
    winnerText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: 0.5,
        marginBottom: 8,
        lineHeight: 44, // Increased line height to prevent clipping
        paddingTop: 10, // Added padding to prevent top clipping
    },
    winnerScorePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    winnerScoreText: {
        fontWeight: '800',
        fontSize: 14,
    },
    podiumContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    lowerContent: {
        paddingTop: 10,
        borderTopLeftRadius: 30, // Visual connection if needed
        borderTopRightRadius: 30,
    },

    runnerUpSection: {
        width: '100%',
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    runnerUpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    runnerUpRank: {
        width: 30,
        fontSize: 16,
        fontWeight: 'bold',
    },
    runnerUpName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    runnerUpScore: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerActions: {
        marginTop: 10,
        paddingHorizontal: 24,
        gap: 8,
    },
    actionBtn: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.20,
        shadowRadius: 4,
        elevation: 6,
    },
    headerImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 450, // Enough to cover top bar and winner info
        zIndex: 0,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
    },
});
