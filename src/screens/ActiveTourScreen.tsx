import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActiveChallengeCard from '../components/activeTourScreen/ActiveChallengeCard';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints';
import StopCard from '../components/activeTourScreen/StopCard';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/Header';
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

    // Fetch active tour data
    const { data: activeTour, loading, error } = useFetch<any>(`/api/active-tour/${activeTourId}`);

    // Local state for immediate UI updates before refetch/sync
    const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
    const [triviaSelected, setTriviaSelected] = useState<{ [key: number]: number }>({}); // challengeId -> selectedIndex

    // Sync completed challenges from API and calculate current stop
    React.useEffect(() => {
        if (activeTour?.activeChallenges && activeTour?.tour?.stops) {
            const completed = new Set<number>(activeTour.activeChallenges
                .filter((ac: any) => ac.completed)
                .map((ac: any) => ac.challengeId));
            setCompletedChallenges(completed);

            // Calculate current stop index
            let index = 0;
            const stops = activeTour.tour.stops;
            for (let i = 0; i < stops.length; i++) {
                const stop = stops[i];
                const allChallengesCompleted = stop.challenges.every((c: any) => completed.has(c.id));
                if (!allChallengesCompleted) {
                    index = i;
                    break;
                }
                // If it's the last stop and all completed, we can stay there or handle completion
                if (i === stops.length - 1 && allChallengesCompleted) {
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
        if (completedChallenges.has(challenge.id)) return;

        // Optimistic update
        const newCompleted = new Set(completedChallenges);
        newCompleted.add(challenge.id);
        setCompletedChallenges(newCompleted);
        triggerFloatingPoints(challenge.points);

        // Check if we should advance to next stop
        const currentStop = activeTour.tour.stops[currentStopIndex];
        const stopChallenges = currentStop.challenges;
        const allStopChallengesDone = stopChallenges.every((c: any) => newCompleted.has(c.id));

        if (allStopChallengesDone) {
            setTimeout(() => {
                if (currentStopIndex < activeTour.tour.stops.length - 1) {
                    setCurrentStopIndex(prev => prev + 1);
                } else {
                    alert("Tour Completed! Congratulations!");
                }
            }, 1000);
        }

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
            // Revert if failed? For now, keep optimistic.
        }
    };

    const handleClaimArrival = (challenge: any) => {
        handleChallengeComplete(challenge);
    };

    const handleSubmitTrivia = (challenge: any) => {
        const selectedIndex = triviaSelected[challenge.id];
        if (selectedIndex === undefined || completedChallenges.has(challenge.id)) return;

        const selectedOption = challenge.options[selectedIndex];
        if (selectedOption === challenge.answer) {
            handleChallengeComplete(challenge);
        } else {
            // Handle wrong answer (maybe show alert)
            alert('Wrong answer, try again!');
        }
    };

    if (loading) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>Loading tour...</Text></View>;
    if (error) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.danger }}>{error}</Text></View>;
    if (!activeTour) return <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}><Text style={{ color: theme.textPrimary }}>Tour not found</Text></View>;

    const currentStop = activeTour.tour.stops[currentStopIndex];
    const stopChallenges = currentStop?.challenges || [];

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

                {stopChallenges.map((challenge: any) => (
                    <ActiveChallengeCard
                        key={challenge.id}
                        title={challenge.title}
                        points={challenge.points}
                        description={challenge.description}
                        type={challenge.type.toLowerCase()}
                        isCompleted={completedChallenges.has(challenge.id)}
                        onPress={() => challenge.type === 'LOCATION' ? handleClaimArrival(challenge) : handleSubmitTrivia(challenge)}
                        actionLabel={challenge.type === 'LOCATION' ? "Claim Points" : "Submit Answer"}
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
                                    {challenge.options.map((option: string, index: number) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.optionRow}
                                            onPress={() => !completedChallenges.has(challenge.id) && setTriviaSelected(prev => ({ ...prev, [challenge.id]: index }))}
                                        >
                                            <View style={[
                                                styles.radioButton,
                                                { borderColor: theme.textSecondary },
                                                triviaSelected[challenge.id] === index && { borderColor: theme.primary, backgroundColor: theme.primary }
                                            ]}>
                                                {triviaSelected[challenge.id] === index && <View style={styles.radioButtonInner} />}
                                            </View>
                                            <Text style={[styles.optionText, { color: theme.textPrimary }]}>{option}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </ActiveChallengeCard>
                ))}
            </ScrollView>

            {showFloatingPoints && (
                <FloatingPoints
                    pointAmount={floatingPointsAmount}
                    onAnimationComplete={() => setShowFloatingPoints(false)}
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
});
