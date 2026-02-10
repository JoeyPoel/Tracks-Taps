import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native'; // Removed Text
import ActiveTourHeader from '../components/active-tour/ActiveTourHeader';
import ActiveTourMap from '../components/active-tour/ActiveTourMap';
import Confetti from '../components/active-tour/animations/Confetti';
import FloatingPoints from '../components/active-tour/animations/FloatingPoints';
import { BingoCard } from '../components/active-tour/BingoCard'; // Added Import
import ChallengeItem from '../components/active-tour/ChallengeItem';
import ChallengeSection from '../components/active-tour/ChallengeSection';
import PubGolfSection from '../components/active-tour/pubGolf/PubGolfSection';
import StopInfoSection from '../components/active-tour/StopInfoSection';
import TourChallengesSection from '../components/active-tour/TourChallengesSection';
import TourNavigation from '../components/active-tour/TourNavigation';
import { AppModal } from '../components/common/AppModal';
import { TextComponent } from '../components/common/TextComponent'; // Added Import
import { TourLoadingScreen } from '../components/common/TourLoadingScreen'; // Added Import
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useActiveTour } from '../hooks/useActiveTour';
import { LevelSystem } from '../utils/levelUtils';

// Wrapper for smooth tab transitions
const TabContentWrapper = ({ children }: { children: React.ReactNode }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
        }}>
            {children}
        </Animated.View>
    );
};

function ActiveTourContent({ activeTourId, user }: { activeTourId: number, user: any }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [selectedBingoChallenge, setSelectedBingoChallenge] = useState<any>(null);

    const { updateUserXp, refreshUser } = useUserContext();

    const {
        activeTour,
        loading,
        error,
        currentStopIndex,
        completedChallenges,
        failedChallenges,
        triviaSelected,
        setTriviaSelected,
        showFloatingPoints,
        floatingPointsAmount,
        setShowFloatingPoints,
        showConfetti,
        handleSubmitTrivia,
        handleChallengeComplete,
        handleChallengeFail,
        handlePrevStop,
        handleNextStop,
        handleFinishTour,
        streak,
        points,
        currentTeam,
        handleSaveSips
    } = useActiveTour(activeTourId, user.id, updateUserXp);

    React.useEffect(() => {
        if (!loading && activeTour) {
            if (activeTour.status === 'PRE_TOUR_LOBBY') {
                router.replace({ pathname: '/(tabs)/lobby', params: { activeTourId } });
            } else if (activeTour.status === 'POST_TOUR_LOBBY' || activeTour.status === 'COMPLETED' || currentTeam?.finishedAt) {
                // Check if we should skip the lobby for single player
                const teamCount = activeTour.teams?.length || 0;
                if (teamCount <= 1) {
                    router.replace({ pathname: '/tour-completed/[id]', params: { id: activeTourId } });
                } else {
                    router.replace({ pathname: '/tour-waiting-lobby/[id]', params: { id: activeTourId } });
                }
            }
        }
    }, [activeTourId, currentTeam?.finishedAt, loading, activeTour?.status, activeTour?.teams?.length]);

    // Derived PubGolf Scores
    const pubGolfScores: Record<number, number> = {};
    if (currentTeam?.pubGolfStops) {
        currentTeam.pubGolfStops.forEach((pgStop: any) => {
            if (pgStop.sips > 0) {
                pubGolfScores[pgStop.stopId] = pgStop.sips;
            }
        });
    }

    if (loading) return <TourLoadingScreen message={t('loadingTour') || "Loading Tour..."} />;
    if (error) return <View style={[styles.centerContainer, { backgroundColor: theme.bgPrimary }]}><TextComponent color={theme.danger}>{error}</TextComponent></View>;
    if (!activeTour) return <View style={[styles.centerContainer, { backgroundColor: theme.bgPrimary }]}><TextComponent>{t('tourNotFound')}</TextComponent></View>;

    const currentStop = activeTour.tour?.stops?.[currentStopIndex];
    const stopChallenges = currentStop?.challenges || [];
    const isLastStop = currentStopIndex === (activeTour.tour?.stops?.length || 0) - 1;

    // Gather ALL challenges (tour-wide + stop-specific) for Bingo Lookup
    const allStopChallenges = activeTour.tour?.stops?.flatMap((s: any) => s.challenges || []) || [];
    const tourWideRefChallenges = activeTour.tour?.challenges || [];
    const allPossibleChallenges = [...tourWideRefChallenges, ...allStopChallenges];

    const tourAllChallenges = activeTour.tour?.challenges || [];
    const bonusChallenges = tourAllChallenges.filter((c: any) => !c.stopId && typeof c.bingoRow !== 'number');

    // --- Dynamic Tab Generation ---
    type TabItem = {
        key: string;
        label: string;
        render: () => React.ReactNode;
    };

    const tabItems: TabItem[] = [
        {
            key: 'info',
            label: t('info'),
            render: () => (
                <TabContentWrapper key="info">
                    <StopInfoSection stop={currentStop} />
                </TabContentWrapper>
            )
        },
        {
            key: 'challenges',
            label: t('challenges'),
            render: () => (
                <TabContentWrapper key="challenges">
                    <ChallengeSection
                        currentStop={currentStop}
                        stopChallenges={stopChallenges}
                        completedChallenges={completedChallenges}
                        failedChallenges={failedChallenges}
                        triviaSelected={triviaSelected}
                        setTriviaSelected={setTriviaSelected}
                        handleChallengeComplete={handleChallengeComplete}
                        handleChallengeFail={handleChallengeFail}
                        handleSubmitTrivia={handleSubmitTrivia}
                    />
                </TabContentWrapper>
            )
        }
    ];

    // Add Bonus Challenges if present
    if (bonusChallenges.length > 0) {
        tabItems.push({
            key: 'bonus',
            label: t('bonus') || 'Bonus',
            render: () => (
                <TabContentWrapper key="bonus">
                    <TourChallengesSection
                        challenges={bonusChallenges}
                        completedChallenges={completedChallenges}
                        failedChallenges={failedChallenges}
                        triviaSelected={triviaSelected}
                        setTriviaSelected={setTriviaSelected}
                        handleChallengeComplete={handleChallengeComplete}
                        handleChallengeFail={handleChallengeFail}
                        handleSubmitTrivia={handleSubmitTrivia}
                    />
                </TabContentWrapper>
            )
        });
    }

    // Add PubGolf Tab (Check for stops with pubgolfPar)
    const hasPubGolfStops = activeTour.tour?.stops?.some((s: any) => s.pubgolfPar != null && s.pubgolfPar > 0);
    if (hasPubGolfStops) {
        tabItems.push({
            key: 'pubgolf',
            label: t('pubgolf'),
            render: () => (
                <TabContentWrapper key="pubgolf">
                    <PubGolfSection
                        activeTour={activeTour}
                        pubGolfScores={pubGolfScores}
                        currentStopId={currentStop?.id}
                        handleSaveSips={handleSaveSips}
                    />
                </TabContentWrapper>
            )
        });
    }

    // Add Bingo Tab (Check mode or challenges existence)
    const hasBingoMode = activeTour.tour?.modes?.includes('BINGO');
    // Also check if there are actual bingo challenges to be safe, or just rely on mode.
    // Given the request "if there is bingo", and the previous implementation relied on mode.
    // I'll stick to 'hasBingoMode' but also ensure currentTeam exists as per previous logic.
    if (hasBingoMode && currentTeam) {
        tabItems.push({
            key: 'bingo',
            label: t('bingo'),
            render: () => (
                <TabContentWrapper key="bingo">
                    <BingoCard
                        team={currentTeam}
                        challenges={allPossibleChallenges}
                        onChallengePress={(challenge: any) => {
                            // Only set if not already completed (or allow viewing completed ones too - usually view is fine)
                            // But usually users want to complete them.
                            setSelectedBingoChallenge(challenge);
                        }}
                    />
                </TabContentWrapper>
            )
        });
    }

    const tabs = tabItems.map(i => i.label);
    const progress = LevelSystem.getProgress(user?.xp || 0);

    // Filter out active challenge wrapper
    const activeBingoChallengeItem = (
        <AppModal
            visible={!!selectedBingoChallenge}
            onClose={() => setSelectedBingoChallenge(null)}
            title={t('bingoChallenge')}
            alignment="center"
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {selectedBingoChallenge && (
                    <ChallengeItem
                        challenge={selectedBingoChallenge}
                        isCompleted={completedChallenges.has(selectedBingoChallenge.id)}
                        isFailed={failedChallenges.has(selectedBingoChallenge.id)}
                        triviaSelected={triviaSelected}
                        setTriviaSelected={setTriviaSelected}
                        onClaimArrival={handleChallengeComplete}
                        onSubmitTrivia={handleSubmitTrivia}
                        onFail={handleChallengeFail}
                        index={0}
                    />
                )}
            </ScrollView>
        </AppModal>
    );


    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <ActiveTourHeader
                level={progress.level}
                currentXP={progress.currentLevelXp}
                maxXP={progress.nextLevelXpStart} // Dynamic max XP
                currentStop={currentStopIndex + 1}
                totalStops={activeTour.tour?.stops?.length || 0}
                streak={streak}
                tokens={points}
                onClose={() => {
                    router.replace('/(tabs)/explore');
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {currentStop && (
                    <View style={styles.mapContainer}>
                        <ActiveTourMap
                            currentStop={currentStop}
                            previousStop={activeTour.tour?.stops?.[currentStopIndex - 1]}
                        />
                    </View>
                )}

                <CustomTabBar
                    tabs={tabs}
                    activeIndex={activeTab}
                    onTabPress={setActiveTab}
                />

                <View style={styles.tabContentContainer}>
                    {/* Render active tab content safely */}
                    {tabItems[activeTab] && tabItems[activeTab].render()}
                </View>

                <TourNavigation
                    currentStopIndex={currentStopIndex}
                    isLastStop={isLastStop}
                    onPrevStop={handlePrevStop}
                    onNextStop={handleNextStop}
                    onFinishTour={async () => {
                        const success = await handleFinishTour();
                        if (success) {
                            await refreshUser(); // Refresh user data to update participations
                            // Navigation is handled by useEffect when state updates
                        }
                    }}
                />
            </ScrollView>

            {showFloatingPoints && (
                <FloatingPoints
                    pointAmount={floatingPointsAmount}
                    onAnimationComplete={() => setShowFloatingPoints(false)}
                />
            )}

            {showConfetti && <Confetti />}

            {/* Render Modal Overlay */}
            {activeBingoChallengeItem}
        </View>
    );
}

// Wrap export default
export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user, loading } = useUserContext();

    if (loading && !user) {
        return <View style={[styles.centerContainer, { backgroundColor: theme.bgPrimary }]}><TextComponent>{t('loading')}</TextComponent></View>;
    }

    if (!user) {
        return <View style={[styles.centerContainer, { backgroundColor: theme.bgPrimary }]}><TextComponent>{t('loginRequired')}</TextComponent></View>;
    }

    return <ActiveTourContent activeTourId={activeTourId} user={user} />;
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 20, // Slightly tighter padding for card look
    },
    mapContainer: {
        borderRadius: 24, // Consistent rounding
        overflow: 'hidden',
        marginVertical: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    tabContentContainer: {
        minHeight: 200, // Prevent layout jumping
        marginTop: 16,
    }
});
