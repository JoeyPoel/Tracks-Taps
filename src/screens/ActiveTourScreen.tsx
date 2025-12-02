import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import ActiveTourHeader from '../components/activeTourScreen/ActiveTourHeader';
import ActiveTourMap from '../components/activeTourScreen/ActiveTourMap';
import ChallengeItem from '../components/activeTourScreen/ChallengeItem';
import Confetti from '../components/activeTourScreen/Confetti';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints';
import PubGolfScoreCard from '../components/activeTourScreen/pubGolf/PubGolfScoreCard';
import PubGolfStopCard from '../components/activeTourScreen/pubGolf/PubGolfStopCard';
import StopCard from '../components/activeTourScreen/StopCard';
import TourNavigation from '../components/activeTourScreen/TourNavigation';
import CustomTabBar from '../components/CustomTabBar';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useActiveTour } from '../hooks/useActiveTour';

export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [pubGolfScores, setPubGolfScores] = useState<Record<number, number>>({});

    const handleSaveSips = (stopId: number, sips: number) => {
        setPubGolfScores(prev => ({ ...prev, [stopId]: sips }));
    };

    const { user, updateUserXp } = useUserContext();

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

    if (loading) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>{t('loadingTour')}</Text></View>;
    if (error) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.danger }}>{error}</Text></View>;
    if (!activeTour) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>{t('tourNotFound')}</Text></View>;

    const currentStop = activeTour.tour.stops[currentStopIndex];
    const stopChallenges = currentStop?.challenges || [];
    const isLastStop = currentStopIndex === activeTour.tour.stops.length - 1;

    const openMaps = async () => {
        if (!currentStop) return;

        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const lat = currentStop.latitude;
        const lng = currentStop.longitude;
        const label = currentStop.name;

        const url = Platform.select({
            ios: `${scheme}${label}@${lat},${lng}`,
            android: `${scheme}${lat},${lng}(${label})`
        });

        if (url) {
            try {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                    await Linking.openURL(url);
                } else {
                    // Fallback to Google Maps web URL
                    const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                    await Linking.openURL(browserUrl);
                }
            } catch (error) {
                console.error("An error occurred", error);
                // Fallback to Google Maps web URL in case of error
                const browserUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                await Linking.openURL(browserUrl);
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <ActiveTourHeader
                level={user?.level || 1}
                currentXP={user?.xp || 0}
                maxXP={2000} // Mock max XP
                currentStop={currentStopIndex + 1}
                totalStops={activeTour.tour.stops.length}
                streak={streak}
                tokens={points}
                onClose={() => router.back()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {currentStop && (
                    <ActiveTourMap
                        currentStop={currentStop}
                        previousStop={activeTour.tour.stops[currentStopIndex - 1]}
                        onNavigate={openMaps}
                    />
                )}

                <CustomTabBar
                    tabs={[`${t('challenges')}`, `${t('pubgolf')}`]}
                    activeIndex={activeTab}
                    onTabPress={setActiveTab}
                />

                {activeTab === 0 ? (
                    <>
                        {currentStop && <StopCard stop={currentStop} />}

                        {stopChallenges.length === 0 ? (
                            <View style={[styles.noChallengesContainer, { backgroundColor: theme.bgTertiary }]}>
                                <Text style={[styles.noChallengesText, { color: theme.textSecondary }]}>
                                    {t('noChallengesAtStop')}
                                </Text>
                            </View>
                        ) : (
                            stopChallenges.map((challenge: any) => {
                                const isFailed = failedChallenges.has(challenge.id);
                                const isCompleted = completedChallenges.has(challenge.id);

                                return (
                                    <ChallengeItem
                                        key={challenge.id}
                                        challenge={challenge}
                                        isCompleted={isCompleted}
                                        isFailed={isFailed}
                                        triviaSelected={triviaSelected}
                                        setTriviaSelected={setTriviaSelected}
                                        onClaimArrival={handleChallengeComplete}
                                        onSubmitTrivia={handleSubmitTrivia}
                                    />
                                )
                            })
                        )}
                    </>
                ) : (
                    <View>
                        {(() => {
                            const pubGolfStops = activeTour.tour.stops.filter((s: any) => s.pubgolfPar);
                            const totalPar = pubGolfStops.reduce((sum: number, s: any) => sum + (s.pubgolfPar || 0), 0);

                            // Calculate totals based on completed stops
                            let totalSips = 0;
                            let currentScore = 0;

                            Object.entries(pubGolfScores).forEach(([stopId, sips]) => {
                                const stop = pubGolfStops.find((s: any) => s.id === parseInt(stopId));
                                if (stop && stop.pubgolfPar) {
                                    totalSips += sips;
                                    currentScore += (sips - stop.pubgolfPar);
                                }
                            });

                            return (
                                <>
                                    <PubGolfScoreCard
                                        totalSips={totalSips}
                                        totalPar={totalPar}
                                        currentScore={currentScore}
                                    />
                                    {pubGolfStops.map((stop: any) => (
                                        <PubGolfStopCard
                                            key={stop.id}
                                            stopNumber={stop.number}
                                            stopName={stop.name}
                                            drinkName={stop.pubgolfDrink || t('drink')}
                                            par={stop.pubgolfPar || 3}
                                            sips={pubGolfScores[stop.id]}
                                            isActive={stop.id === currentStop?.id}
                                            onSave={(sips) => handleSaveSips(stop.id, sips)}
                                        />
                                    ))}
                                </>
                            );
                        })()}
                    </View>
                )}

                <TourNavigation
                    currentStopIndex={currentStopIndex}
                    isLastStop={isLastStop}
                    onPrevStop={handlePrevStop}
                    onNextStop={handleNextStop}
                    onFinishTour={async () => {
                        const success = await handleFinishTour();
                        if (success) {
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
    noChallengesContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        marginBottom: 16,
    },
    noChallengesText: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
