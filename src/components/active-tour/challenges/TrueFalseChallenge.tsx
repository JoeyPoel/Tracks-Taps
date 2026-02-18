import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { AnimatedPressable } from '../../common/AnimatedPressable';
import ActiveChallengeCard from '../ActiveChallengeCard';

import { Challenge } from '../../../types/models';

interface TrueFalseChallengeProps {
    challenge: Challenge;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: Challenge) => void;
    onFail: (challenge: Challenge) => void;
    index?: number;
    isBonus?: boolean;
}

const TrueFalseChallenge: React.FC<TrueFalseChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    onFail,
    index,
    isBonus = false
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [selected, setSelected] = useState<string | null>(null);
    const isDone = isCompleted || isFailed;

    const handleSelect = (value: string) => {
        if (isDone) return;
        setSelected(value);
    };

    const handleSubmit = (): void => {
        if (!selected || isDone) return;

        const correctAnswer = challenge.answer?.toLowerCase(); // 'true' or 'false'
        if (selected === correctAnswer) {
            onComplete(challenge);
        } else {
            onFail(challenge);
        }
    };

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            type="trivia"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handleSubmit}
            actionLabel={t('submitAnswer') || "Submit"}
            disabled={isDone || !selected}
            index={index}
            isBonus={isBonus}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {challenge.content}
            </Text>
            <View style={styles.content}>

                <View style={styles.optionsRow}>
                    {['true', 'false'].map((option) => {
                        const isSelected = selected === option;
                        // Determine styling based on state
                        let backgroundColor = 'transparent';
                        let borderColor = theme.borderPrimary;
                        let textColor = theme.textPrimary;

                        if (isDone) {
                            if (option === challenge.answer?.toLowerCase()) {
                                borderColor = theme.success;
                                backgroundColor = 'rgba(0, 255, 0, 0.1)';
                                textColor = theme.success;
                            } else if (isSelected && isFailed) {
                                borderColor = theme.danger;
                                backgroundColor = 'rgba(255, 0, 0, 0.1)';
                                textColor = theme.danger;
                            }
                        } else if (isSelected) {
                            borderColor = theme.primary;
                            backgroundColor = theme.primary;
                            textColor = theme.fixedWhite;
                        }

                        return (
                            <AnimatedPressable
                                key={option}
                                style={[
                                    styles.optionButton,
                                    { borderColor, backgroundColor }
                                ]}
                                onPress={() => handleSelect(option)}
                                disabled={isDone}
                                interactionScale="subtle"
                                haptic="selection"
                            >
                                <Text style={[styles.optionText, { color: textColor }]}>
                                    {option === 'true' ? t('true') : t('false')}
                                </Text>
                            </AnimatedPressable>
                        );
                    })}
                </View>

                {isFailed && (
                    <Text style={[styles.feedback, { color: theme.danger }]}>
                        {t('wrongAnswer')}
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
    content: {
        marginBottom: 8,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    optionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    optionButton: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    feedback: {
        marginTop: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default TrueFalseChallenge;
