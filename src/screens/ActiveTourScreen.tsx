import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FloatingPoints from '../components/activeTourScreen/FloatingPoints';
import AppHeader from '../components/Header';
import { useTheme } from '../context/ThemeContext';

export default function ActiveTourScreen({ activeTourId }: { activeTourId: number }) {
    const { theme } = useTheme();
    const router = useRouter();
    const [points, setPoints] = useState(0);
    const [showFloatingPoints, setShowFloatingPoints] = useState(false);
    const [floatingPointsAmount, setFloatingPointsAmount] = useState(0);

    const [triviaSelected, setTriviaSelected] = useState<number | null>(null);
    const [triviaSubmitted, setTriviaSubmitted] = useState(false);
    const [arrivalClaimed, setArrivalClaimed] = useState(false);

    const handleClaimArrival = () => {
        if (arrivalClaimed) return;
        setArrivalClaimed(true);
        triggerFloatingPoints(50);
    };

    const handleSubmitTrivia = () => {
        if (triviaSelected === null || triviaSubmitted) return;
        setTriviaSubmitted(true);
        // Mock correct answer check
        if (triviaSelected === 0) { // Assuming first option is correct for demo
            triggerFloatingPoints(100);
        }
    };

    const triggerFloatingPoints = (amount: number) => {
        setFloatingPointsAmount(amount);
        setShowFloatingPoints(true);
        setPoints(prev => prev + amount);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
            <AppHeader
                onBackPress={() => router.back()}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Arrival Check Card */}
                <LinearGradient
                    colors={[`${theme.bgPrimary}`, `${theme.bgPrimary}`]} // TODO: Use gradient if available in theme or fixed colors
                    style={[styles.card, { borderColor: theme.borderPrimary, borderWidth: 1 }]}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="location-outline" size={24} color={theme.primary} />
                            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Arrival Check</Text>
                        </View>
                        <View style={styles.pointsBadge}>
                            <Ionicons name="flash" size={16} color="#FFD700" />
                            <Text style={styles.pointsText}>50</Text>
                        </View>
                    </View>

                    <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                        You've reached the first stop! Check in to claim your points.
                    </Text>

                    <Text style={[styles.successText, { color: theme.primary }]}>
                        You're at the right location!
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.primary, opacity: arrivalClaimed ? 0.6 : 1 }]}
                        onPress={handleClaimArrival}
                        disabled={arrivalClaimed}
                    >
                        <Text style={styles.buttonText}>{arrivalClaimed ? 'Points Claimed' : 'Claim Points'}</Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Pub Trivia Card */}
                <LinearGradient
                    colors={[`${theme.bgPrimary}`, `${theme.bgPrimary}`]}
                    style={[styles.card, { borderColor: theme.borderPrimary, borderWidth: 1 }]}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardTitleRow}>
                            <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
                            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Pub Trivia</Text>
                        </View>
                        <View style={styles.pointsBadge}>
                            <Ionicons name="flash" size={16} color="#FFD700" />
                            <Text style={styles.pointsText}>100</Text>
                        </View>
                    </View>

                    <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                        Test your knowledge about this historic pub!
                    </Text>

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

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.secondary, opacity: triviaSubmitted ? 0.6 : 1 }]}
                        onPress={handleSubmitTrivia}
                        disabled={triviaSubmitted}
                    >
                        <Text style={styles.buttonText}>{triviaSubmitted ? 'Answer Submitted' : 'Submit Answer'}</Text>
                    </TouchableOpacity>
                </LinearGradient>

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
        padding: 16,
        paddingBottom: 40,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        // Elevation for Android
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pointsText: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cardDescription: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    successText: {
        textAlign: 'center',
        marginBottom: 16,
        fontWeight: '600',
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    questionText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    optionsContainer: {
        marginBottom: 20,
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
