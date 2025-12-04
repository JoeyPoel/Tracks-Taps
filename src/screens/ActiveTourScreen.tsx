import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { openMapApp } from '../utils/mapUtils';

export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [pubGolfScores, setPubGolfScores] = useState<Record<number, number>>({});

    const { user, updateUserXp, refreshUser } = useUserContext();

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
        handlePrevStop,
        handleNextStop,
        handleFinishTour,
        streak,
        points,
    } = useActiveTour(activeTourId, user?.id, updateUserXp);

    // Initialize scores from activeTour data
    useEffect(() => {
        if (activeTour?.pubGolfStops) {
            const initialScores: Record<number, number> = {};
            activeTour.pubGolfStops.forEach((pgStop: any) => {
                if (pgStop.sips > 0) {
                    initialScores[pgStop.stopId] = pgStop.sips;
                }
            });
            setPubGolfScores(initialScores);
        }
    }, [activeTour]);

    const handleSaveSips = async (stopId: number, sips: number) => {
        try {
            // Optimistic update
            setPubGolfScores(prev => ({ ...prev, [stopId]: sips }));

            // Call backend
            await activeTourService.updatePubGolfScore(activeTourId, stopId, sips);
        } catch (error) {
            console.error("Failed to save sips:", error);
            // Revert on error (optional, but good practice)
        }
    };

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

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <ActiveTourHeader
                level={user?.level || 1}
                currentXP={user?.xp || 0}
                maxXP={2000} // Mock max XP
                currentStop={currentStopIndex + 1}
                totalStops={activeTour.tour?.stops?.length || 0}
                streak={streak}
                tokens={points}
                onClose={() => router.back()}
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
                    tabs={[`${t('challenges')}`, `${t('pubgolf')}`]}
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
                        handleSubmitTrivia={handleSubmitTrivia}
                    />
                ) : (
                    <PubGolfSection
                        activeTour={activeTour}
                        pubGolfScores={pubGolfScores}
                        currentStopId={currentStop?.id}
                        handleSaveSips={handleSaveSips}
                    />
                )}

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
                                router.replace('/(tabs)/explore');
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
});
