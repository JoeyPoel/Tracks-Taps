import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActiveChallengeCard from '../components/activeTourScreen/ActiveChallengeCard';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints';
import StopCard from '../components/activeTourScreen/StopCard';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/Header';
import { useTheme } from '../context/ThemeContext';

export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);
    const [activeTab, setActiveTab] = useState(0);

    // Challenge States
    const [arrivalClaimed, setArrivalClaimed] = useState(false);
    const [triviaSubmitted, setTriviaSubmitted] = useState(false);
    const [triviaSelected, setTriviaSelected] = useState<number | null>(null);

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
        setPoints(prev => prev + amount);
    };

    const handleClaimArrival = () => {
        if (arrivalClaimed) return;
        setArrivalClaimed(true);
        triggerFloatingPoints(50);
    };

    const handleSubmitTrivia = () => {
        if (triviaSelected === null || triviaSubmitted) return;
        setTriviaSubmitted(true);
        // Mock correct answer check (index 0 is correct)
        if (triviaSelected === 0) {
            triggerFloatingPoints(100);
        }
    };

    // Mock stop data
    const stop = {
        id: 1,
        name: 'Utrecht Historical Bingo',
        description: 'This is a description of the stop.',
        latitude: 52.0907,
        longitude: 5.1214,
        tourId: 1,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

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
                <StopCard stop={stop} />

                <ActiveChallengeCard
                    title="Arrival Check"
                    points={50}
                    description="You've reached the first stop! Check in to claim your points."
                    type="location"
                    isCompleted={arrivalClaimed}
                    onPress={handleClaimArrival}
                    actionLabel="Claim Points"
                >
                    <Text style={[styles.successText, { color: theme.primary }]}>
                        You're at the right location!
                    </Text>
                </ActiveChallengeCard>

                <ActiveChallengeCard
                    title="Pub Trivia"
                    points={100}
                    description="Test your knowledge about this historic pub!"
                    type="trivia"
                    isCompleted={triviaSubmitted}
                    onPress={handleSubmitTrivia}
                    actionLabel="Submit Answer"
                >
                    <View>
                        <Text style={[styles.questionText, { color: theme.textPrimary }]}>
                            In what year was this pub established?
                        </Text>
                        <View style={styles.optionsContainer}>
                            {['1652', '1705', '1823', '1901'].map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionRow}
                                    onPress={() => !triviaSubmitted && setTriviaSelected(index)}
                                >
                                    <View style={[
                                        styles.radioButton,
                                        { borderColor: theme.textSecondary },
                                        triviaSelected === index && { borderColor: theme.primary, backgroundColor: theme.primary }
                                    ]}>
                                        {triviaSelected === index && <View style={styles.radioButtonInner} />}
                                    </View>
                                    <Text style={[styles.optionText, { color: theme.textPrimary }]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ActiveChallengeCard>
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
