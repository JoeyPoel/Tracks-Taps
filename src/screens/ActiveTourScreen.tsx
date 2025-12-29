import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from 'react-native';
import ActiveTourHeader from '../components/active-tour/ActiveTourHeader';
import ActiveTourMap from '../components/active-tour/ActiveTourMap';
import Confetti from '../components/active-tour/animations/Confetti';
import FloatingPoints from '../components/active-tour/animations/FloatingPoints';
import ChallengeSection from '../components/active-tour/ChallengeSection';
import PubGolfSection from '../components/active-tour/pubGolf/PubGolfSection';
import StopInfoSection from '../components/active-tour/StopInfoSection';
import TourChallengesSection from '../components/active-tour/TourChallengesSection';
import TourNavigation from '../components/active-tour/TourNavigation';
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
        if (!loading && currentTeam?.finishedAt) {
            router.replace({ pathname: '/tour-waiting-lobby/[id]', params: { id: activeTourId } });
        }
    }, [activeTourId, currentTeam, loading]);

    // Derived PubGolf Scores
    const pubGolfScores: Record<number, number> = {};
    if (currentTeam?.pubGolfStops) {
        currentTeam.pubGolfStops.forEach((pgStop: any) => {
            if (pgStop.sips > 0) {
                pubGolfScores[pgStop.stopId] = pgStop.sips;
            }
        });
    }

    if (loading) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>{t('loadingTour')}</Text></View>;
    if (error) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.danger }}>{error}</Text></View>;
    if (!activeTour) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>{t('tourNotFound')}</Text></View>;

    const currentStop = activeTour.tour?.stops?.[currentStopIndex];
    const stopChallenges = currentStop?.challenges || [];
    const isLastStop = currentStopIndex === (activeTour.tour?.stops?.length || 0) - 1;

    // Filter for tour-wide challenges (challenges with no stopId)
    // Note: activeTour.tour.challenges contains ALL challenges for the tour, so we filter.
    const tourAllChallenges = activeTour.tour?.challenges || [];
    const tourWideChallenges = tourAllChallenges.filter((c: any) => !c.stopId);

    const hasTourChallenges = tourWideChallenges.length > 0;
    const hasPubGolf = activeTour.tour?.modes?.includes('PUBGOLF');

    // Define Tabs dynamically
    const tabs = [`${t('info')}`, `${t('challenges')}`];
    if (hasTourChallenges) tabs.push(t('tourWideChallenges') || 'Tour Challenges');
    if (hasPubGolf) tabs.push(`${t('pubgolf')}`);

    // Helper to resolve tab content
    const TAB_INFO = 0;
    const TAB_STOP_CHALLENGES = 1;
    const TAB_TOUR_CHALLENGES = hasTourChallenges ? 2 : -1;
    const TAB_PUBGOLF = hasPubGolf ? (hasTourChallenges ? 3 : 2) : -1;



    const progress = LevelSystem.getProgress(user?.xp || 0);

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
                    router.dismissAll();
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
                    {activeTab === TAB_INFO && (
                        <TabContentWrapper key="info">
                            <StopInfoSection stop={currentStop} />
                        </TabContentWrapper>
                    )}

                    {activeTab === TAB_STOP_CHALLENGES && (
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
                    )}

                    {activeTab === TAB_TOUR_CHALLENGES && (
                        <TabContentWrapper key="tour-challenges">
                            <TourChallengesSection
                                challenges={tourWideChallenges}
                                completedChallenges={completedChallenges}
                                failedChallenges={failedChallenges}
                                triviaSelected={triviaSelected}
                                setTriviaSelected={setTriviaSelected}
                                handleChallengeComplete={handleChallengeComplete}
                                handleChallengeFail={handleChallengeFail}
                                handleSubmitTrivia={handleSubmitTrivia}
                            />
                        </TabContentWrapper>
                    )}

                    {activeTab === TAB_PUBGOLF && (
                        <TabContentWrapper key="pubgolf">
                            <PubGolfSection
                                activeTour={activeTour}
                                pubGolfScores={pubGolfScores}
                                currentStopId={currentStop?.id}
                                handleSaveSips={handleSaveSips}
                            />
                        </TabContentWrapper>
                    )}
                </View>

                <TourNavigation
                    currentStopIndex={currentStopIndex}
                    isLastStop={isLastStop}
                    onPrevStop={handlePrevStop}
                    onNextStop={handleNextStop}
                    onFinishTour={async () => {
                        const success = await handleFinishTour();
                        if (success) {
                            setTimeout(async () => {
                                await refreshUser(); // Refresh user data to update participations
                                router.dismissAll();
                                if ((activeTour.teams?.length || 0) > 1) {
                                    router.replace({ pathname: '/tour-waiting-lobby/[id]', params: { id: activeTourId } });
                                } else {
                                    router.replace({ pathname: '/tour-completed/[id]', params: { id: activeTourId } });
                                }
                            }, 3000);
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
        </View>
    );
}

// Wrap export default
export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { user, loading } = useUserContext();

    if (loading && !user) {
        return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>{t('loading')}</Text></View>;
    }

    if (!user) {
        return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>{t('loginRequired')}</Text></View>;
    }

    return <ActiveTourContent activeTourId={activeTourId} user={user} />;
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
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
