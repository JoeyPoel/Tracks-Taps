import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import ActiveChallengeCard from './ActiveChallengeCard';

interface ChallengeItemProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    triviaSelected: { [key: number]: number };
    setTriviaSelected: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
    onClaimArrival: (challenge: any) => void;
    onSubmitTrivia: (challenge: any) => void;
}

const ChallengeItem: React.FC<ChallengeItemProps> = ({
    challenge,
    isCompleted,
    isFailed,
    triviaSelected,
    setTriviaSelected,
    onClaimArrival,
    onSubmitTrivia,
}) => {
    const { theme } = useTheme();
    const isDone = isCompleted || isFailed;

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            description={challenge.description}
            type={challenge.type.toLowerCase()}
            isCompleted={isCompleted}
            onPress={() => challenge.type === 'LOCATION' ? onClaimArrival(challenge) : onSubmitTrivia(challenge)}
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
    );
};

const styles = StyleSheet.create({
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

export default ChallengeItem;
