import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { AnimatedPressable } from '../../common/AnimatedPressable';
import ActiveChallengeCard from '../ActiveChallengeCard';

interface TriviaChallengeProps {
    challenge: any;
    isCompleted: boolean;
    isFailed: boolean;
    triviaSelected: { [key: number]: number };
    setTriviaSelected: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
    onSubmit: (challenge: any) => void;
}

const TriviaChallenge: React.FC<TriviaChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    triviaSelected,
    setTriviaSelected,
    onSubmit
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDone = isCompleted || isFailed;

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            type="trivia"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={() => onSubmit(challenge)}
            actionLabel={isFailed ? (t('wrongAnswer') || "Wrong Answer") : isCompleted ? (t('completed') || "Completed") : (t('submitAnswer') || "Submit Answer")}
            disabled={isDone}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {challenge.content}
            </Text>
            <View>
                {/* Content moved to card header */}
                <View style={styles.optionsContainer}>
                    {challenge.options.map((option: string, index: number) => {
                        const isSelected = triviaSelected[challenge.id] === index;
                        const isCorrect = option === challenge.answer;

                        let borderColor = theme.textSecondary;
                        let backgroundColor = 'transparent';

                        if (isDone) {
                            if (isCorrect) {
                                borderColor = theme.challengeCorrectBorder;
                                backgroundColor = theme.challengeCorrectBackground
                            } else if (isSelected && isFailed) {
                                borderColor = theme.challengeFailedBorder;
                                backgroundColor = theme.challengeFailedBackground
                            }
                        } else if (isSelected) {
                            borderColor = theme.primary;
                            backgroundColor = theme.primary;
                        }

                        return (
                            <AnimatedPressable
                                key={index}
                                style={styles.optionRow}
                                onPress={() => !isDone && setTriviaSelected((prev: any) => ({ ...prev, [challenge.id]: index }))}
                                disabled={isDone}
                                interactionScale="subtle"
                                haptic="selection"
                            >
                                <View style={[
                                    styles.radioButton,
                                    { borderColor },
                                    isSelected && !isDone && { backgroundColor: theme.primary }
                                ]}>
                                    {isSelected && !isDone && <View style={[styles.radioButtonInner, { backgroundColor: theme.fixedWhite }]} />}
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    { color: theme.textPrimary },
                                    isDone && isCorrect && { color: theme.success, fontWeight: 'bold' },
                                    isDone && isSelected && isFailed && { color: theme.danger, fontWeight: 'bold' }
                                ]}>{option}</Text>
                            </AnimatedPressable>
                        )
                    })}
                </View>
                {isFailed && (
                    <Text style={{ color: theme.danger, marginTop: 8, fontWeight: 'bold' }}>
                        {t('wrongAnswerCorrectWas') || "Correct answer was:"} {challenge.answer}
                    </Text>
                )}
            </View>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
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
    },
    optionText: {
        fontSize: 16,
    },
});

export default TriviaChallenge;
