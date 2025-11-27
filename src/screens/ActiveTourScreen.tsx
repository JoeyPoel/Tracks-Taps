import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import ActiveChallengeCard from '../components/activeTourScreen/ActiveChallengeCard';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints';
import StopCard from '../components/activeTourScreen/StopCard';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/Header';
import StartTourButton from '../components/TourButton';
import { useTheme } from '../context/ThemeContext';
import { useFetch } from '../hooks/useFetch';

export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<ConfettiCannon>(null);

    // Fetch active tour data
    const { data: activeTour, loading, error } = useFetch<any>(`/api/active-tour/${activeTourId}`);

    // Local state for immediate UI updates before refetch/sync
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [failedChallenges, setFailedChallenges] = useState<Set<number>>(new Set());
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({}); // challengeId -> selectedIndex

    // Sync completed and failed challenges from API and calculate current stop
    React.useEffect(() => {
        if (activeTour?.activeChallenges && activeTour?.tour?.stops) {
            const completed = new Set<number>();
            const failed = new Set<number>();

            activeTour.activeChallenges.forEach((ac: any) => {
                if (ac.completed) completed.add(ac.challengeId);
                if (ac.failed) failed.add(ac.challengeId);
            });

            setCompletedChallenges(completed);
            setFailedChallenges(failed);

            // Calculate current stop index only on initial load if not set
            // (We don't want to jump around if user manually navigated)
            // But for now, let's keep the auto-sync logic simple or maybe disable it if we want manual control?
            // The user asked for manual buttons, so maybe we should trust manual navigation more.
            // However, the previous requirement was auto-advance.
            // Let's keep auto-advance but allow manual override.

            // To prevent overriding manual navigation, we could check if currentStopIndex is 0 (initial)
            // But useEffect runs on updates too. Let's just set it once or if we really want to sync.
            // Let's rely on the user's manual navigation mostly, but initial load is fine.
            let index = 0;
            const stops = activeTour.tour.stops;
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                const allChallengesDone = stop.challenges.every((c: any) => completed.has(c.id) || failed.has(c.id));
                if (!allChallengesDone) {
                    index = i;
                    break;
                }
                // If it's the last stop and all completed/failed, we can stay there or handle completion
                if (i === stops.length - 1 && allChallengesDone) {
                    index = i;
                }
            }
            setCurrentStopIndex(index);
        }
    }, [activeTour]);

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
        setPoints(prev => prev + amount);
    };

    const handleChallengeComplete = async (challenge: any) => {
        if (completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newCompleted = new Set(completedChallenges);
        newCompleted.add(challenge.id);
        setCompletedChallenges(newCompleted);
        triggerFloatingPoints(challenge.points);

        checkAutoAdvance(newCompleted, failedChallenges);

        try {
            await fetch('/api/active-challenge/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTourId,
                    challengeId: challenge.id
                })
            });
        } catch (err) {
            console.error('Failed to complete challenge', err);
        }
    };

    const handleChallengeFail = async (challenge: any) => {
        if (completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newFailed = new Set(failedChallenges);
        newFailed.add(challenge.id);
        setFailedChallenges(newFailed);

        checkAutoAdvance(completedChallenges, newFailed);

        try {
            await fetch('/api/active-challenge/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activeTourId,
                    challengeId: challenge.id
                })
            });
        } catch (err) {
            console.error('Failed to fail challenge', err);
        }
    };

    const checkAutoAdvance = (completed: Set<number>, failed: Set<number>) => {
        const currentStop = activeTour.tour.stops[currentStopIndex];
        const stopChallenges = currentStop.challenges;
        const allStopChallengesDone = stopChallenges.every((c: any) => completed.has(c.id) || failed.has(c.id));

        if (allStopChallengesDone) {
            setTimeout(() => {
                if (currentStopIndex < activeTour.tour.stops.length - 1) {
                    setCurrentStopIndex(prev => prev + 1);
                }
            }, 1500);
        }
    };

    const handleClaimArrival = (challenge: any) => {
        handleChallengeComplete(challenge);
    };

    const handleSubmitTrivia = (challenge: any) => {
        const selectedIndex = triviaSelected[challenge.id];
        if (selectedIndex === undefined || completedChallenges.has(challenge.id) || failedChallenges.has(challenge.id)) return;

        const selectedOption = challenge.options[selectedIndex];
        if (selectedOption === challenge.answer) {
            handleChallengeComplete(challenge);
        } else {
            handleChallengeFail(challenge);
        }
    };

    const handlePrevStop = () => {
        if (currentStopIndex > 0) {
            setCurrentStopIndex(prev => prev - 1);
        }
    };

    const handleNextStop = () => {
        if (activeTour && currentStopIndex < activeTour.tour.stops.length - 1) {
            setCurrentStopIndex(prev => prev + 1);
        }
    };

    const handleFinishTour = () => {
        setShowConfetti(true);
        confettiRef.current?.start();
    };

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
                        const isDone = isFailed || isCompleted;

                        return (
                            <ActiveChallengeCard
                                key={challenge.id}
                                title={challenge.title}
                                points={challenge.points}
                                description={challenge.description}
                                type={challenge.type.toLowerCase()}
                                isCompleted={isCompleted}
                                onPress={() => challenge.type === 'LOCATION' ? handleClaimArrival(challenge) : handleSubmitTrivia(challenge)}
                                actionLabel={
                                    isFailed ? "Wrong Answer" :
                                        isCompleted ? "Completed" :
                                            challenge.type === 'LOCATION' ? "Claim Points" : "Submit Answer"
                                }
                                disabled={isDone}
                            >
                                {challenge.type === 'LOCATION' ? (
                                    <Text style={[styles.successText, { color: theme.primary }]}>
                                        You're at the right location!
                                    </Text>
                                ) : (
                                    <View>
                                        <Text style={[styles.questionText, { color: theme.textPrimary }]}>
                                            {challenge.content}
                                        </Text>
                                        <View style={styles.optionsContainer}>
                                            {challenge.options.map((option: string, index: number) => {
                                                const isSelected = triviaSelected[challenge.id] === index;
                                                const isCorrect = option === challenge.answer;

                                                let borderColor = theme.textSecondary;
                                                let backgroundColor = 'transparent';

                                                if (isDone) {
                                                    if (isCorrect) {
                                                        borderColor = theme.primary; // Show correct answer
                                                        backgroundColor = theme.primary + '33'; // Light green bg
                                                    } else if (isSelected && isFailed) {
                                                        borderColor = theme.danger; // Show selected wrong answer
                                                        backgroundColor = theme.danger + '33'; // Light red bg
                                                    }
                                                } else if (isSelected) {
                                                    borderColor = theme.primary;
                                                    backgroundColor = theme.primary;
                                                }

                                                return (
                                                    <TouchableOpacity
                                                        key={index}
                                                        style={styles.optionRow}
                                                        onPress={() => !isDone && setTriviaSelected(prev => ({ ...prev, [challenge.id]: index }))}
                                                        disabled={isDone}
                                                    >
                                                        <View style={[
                                                            styles.radioButton,
                                                            { borderColor },
                                                            isSelected && !isDone && { backgroundColor: theme.primary }
                                                        ]}>
                                                            {isSelected && !isDone && <View style={styles.radioButtonInner} />}
                                                        </View>
                                                        <Text style={[
                                                            styles.optionText,
                                                            { color: theme.textPrimary },
                                                            isDone && isCorrect && { color: theme.primary, fontWeight: 'bold' },
                                                            isDone && isSelected && isFailed && { color: theme.danger }
                                                        ]}>{option}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </View>
                                        {isFailed && (
                                            <Text style={{ color: theme.danger, marginTop: 8, fontWeight: 'bold' }}>
                                                Wrong answer! The correct answer was: {challenge.answer}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </ActiveChallengeCard>
                        )
                    })
                )}

                {/* Navigation Buttons */}
                <View style={styles.navigationContainer}>
                    {currentStopIndex > 0 && (
                        <TouchableOpacity
                            style={[styles.navButton, styles.secondaryButton, { borderColor: theme.textSecondary }]}
                            onPress={handlePrevStop}
                        >
                            <Text style={[styles.navButtonText, { color: theme.textSecondary }]}>Back</Text>
                        </TouchableOpacity>
                    )}

                    {isLastStop ? (
                        <View style={{ flex: 1 }}>
                            <StartTourButton onPress={handleFinishTour} buttonText="Finish Tour" />
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.navButton, styles.primaryButton, { backgroundColor: theme.primary }]}
                            onPress={handleNextStop}
                        >
                            <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>Next</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {showFloatingPoints && (
                <FloatingPoints
                    pointAmount={floatingPointsAmount}
                    onAnimationComplete={() => setShowFloatingPoints(false)}
                />
            )}

            {showConfetti && (
                <ConfettiCannon
                    count={200}
                    origin={{ x: Dimensions.get('window').width / 2, y: -10 }}
                    autoStart={true}
                    ref={confettiRef}
                    fadeOut={true}
                />
            )}
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
    successText: {
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    optionsContainer: {
        marginBottom: 8,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
    },
    optionText: {
        fontSize: 16,
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        gap: 16,
    },
    navButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        // Background color set in inline style
    },
    secondaryButton: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
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
