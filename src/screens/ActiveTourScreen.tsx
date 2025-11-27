import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ChallengeItem from '../components/activeTourScreen/ChallengeItem';
import Confetti from '../components/activeTourScreen/Confetti';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints';
import StopCard from '../components/activeTourScreen/StopCard';
import TourNavigation from '../components/activeTourScreen/TourNavigation';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useActiveTour } from '../hooks/useActiveTour';

export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(0);

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
        handleClaimArrival,
        handleSubmitTrivia,
        handlePrevStop,
        handleNextStop,
        handleFinishTour,
    } = useActiveTour(activeTourId);

    if (loading) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>Loading tour...</Text></View>;
    if (error) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.danger }}>{error}</Text></View>;
    if (!activeTour) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>Tour not found</Text></View>;

    const currentStop = activeTour.tour.stops[currentStopIndex];
    const stopChallenges = currentStop?.challenges || [];
    const isLastStop = currentStopIndex === activeTour.tour.stops.length - 1;

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <AppHeader
                onBackPress={() => router.back()}
            />

            <CustomTabBar
                tabs={[`Iterary`, 'Tour goals', 'Pub Golf']}
                activeIndex={activeTab}
                onTabPress={setActiveTab}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {currentStop && <StopCard stop={currentStop} />}

                {stopChallenges.length === 0 ? (
                    <View style={styles.noChallengesContainer}>
                        <Text style={[styles.noChallengesText, { color: theme.textSecondary }]}>
                            No challenges at this stop. Enjoy the view!
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
                                onClaimArrival={handleClaimArrival}
                                onSubmitTrivia={handleSubmitTrivia}
                            />
                        )
                    })
                )}

                <TourNavigation
                    currentStopIndex={currentStopIndex}
                    isLastStop={isLastStop}
                    onPrevStop={handlePrevStop}
                    onNextStop={handleNextStop}
                    onFinishTour={handleFinishTour}
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
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        marginBottom: 16,
    },
    noChallengesText: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});
