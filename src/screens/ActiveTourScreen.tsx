import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ActiveTourHeader from '../components/activeTourScreen/ActiveTourHeader';
import ActiveTourMap from '../components/activeTourScreen/ActiveTourMap';
import Confetti from '../components/activeTourScreen/animations/Confetti';
import FloatingPoints from '../components/activeTourScreen/animations/FloatingPoints';
import ChallengeSection from '../components/activeTourScreen/ChallengeSection';
import PubGolfSection from '../components/activeTourScreen/pubGolf/PubGolfSection';
import TourNavigation from '../components/activeTourScreen/TourNavigation';
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useActiveTour } from '../hooks/useActiveTour';
import { activeTourService } from '../services/activeTourService';
import { LevelSystem } from '../utils/levelUtils';
import { openMapApp } from '../utils/mapUtils';

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
        handleAbandonTour,
        streak,
        points,
        updateActiveTourLocal,
        currentTeam,
    } = useActiveTour(activeTourId, user.id, updateUserXp);



    const handleSaveSips = async (stopId: number, sips: number) => {
        if (!currentTeam) return;

        // Optimistic update via Store
        const updatedPubGolfStops = currentTeam.pubGolfStops?.map((pg: any) =>
            pg.stopId === stopId ? { ...pg, sips } : pg
        ) || [];

        // If not found, add it? (Logic implies it exists from seed, but strictly might need to create)
        if (!updatedPubGolfStops.find((pg: any) => pg.stopId === stopId)) {
            updatedPubGolfStops.push({ stopId, sips, teamId: currentTeam.id });
        }

        const updatedTeam = { ...currentTeam, pubGolfStops: updatedPubGolfStops };
        const previousTeams = activeTour?.teams || [];

        updateActiveTourLocal({ teams: [updatedTeam] });

        if (user.id) {
            try {
                // FIRE AND FORGET
                await activeTourService.updatePubGolfScore(activeTourId, stopId, sips, user.id);
            } catch (error) {
                console.error("Failed to save sips:", error);
                // Revert
                updateActiveTourLocal({ teams: previousTeams });
            }
        }
    };

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

    const openMaps = async () => {
        if (!currentStop) return;
        await openMapApp(currentStop.latitude, currentStop.longitude, currentStop.name);
    };

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
                    router.replace({ pathname: '/tour/[id]', params: { id: activeTour.tourId } });
                }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {currentStop && (
                    <ActiveTourMap
                        currentStop={currentStop}
                        previousStop={activeTour.tour?.stops?.[currentStopIndex - 1]}
                        onNavigate={openMaps}
                    />
                )}

                <CustomTabBar
                    tabs={
                        activeTour.tour?.modes?.includes('PUBGOLF')
                            ? [`${t('challenges')}`, `${t('pubgolf')}`]
                            : [`${t('challenges')}`]
                    }
                    activeIndex={activeTab}
                    onTabPress={setActiveTab}
                />

                {activeTab === 0 ? (
                    <ChallengeSection
                        currentStop={currentStop}
                        stopChallenges={stopChallenges}
                        completedChallenges={completedChallenges}
                        failedChallenges={failedChallenges}
                        triviaSelected={triviaSelected}
                        setTriviaSelected={setTriviaSelected}
                        handleChallengeComplete={handleChallengeComplete}
                        handleChallengeFail={handleChallengeFail} // Pass handler
                        handleSubmitTrivia={handleSubmitTrivia}
                    />
                ) : activeTour.tour?.modes?.includes('PUBGOLF') && activeTab === 1 ? (
                    <PubGolfSection
                        activeTour={activeTour}
                        pubGolfScores={pubGolfScores}
                        currentStopId={currentStop?.id}
                        handleSaveSips={handleSaveSips}
                    />
                ) : null}

                <TourNavigation
                    currentStopIndex={currentStopIndex}
                    isLastStop={isLastStop}
                    onPrevStop={handlePrevStop}
                    onNextStop={handleNextStop}
                    onFinishTour={async () => {
                        const success = await handleFinishTour();
                        if (success) {
                            await refreshUser(); // Refresh user data to update participations
                            setTimeout(() => {
                                router.dismissAll();
                                router.replace({ pathname: '/tour-waiting-lobby/[id]', params: { id: activeTourId } });
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
        paddingHorizontal: 24,
    },
});
