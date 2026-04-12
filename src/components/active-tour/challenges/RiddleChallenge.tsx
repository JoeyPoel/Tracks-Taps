import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTranslation } from '../../../context/TranslationContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';
import { isFlexibleMatch } from '../../../utils/stringUtils';

import { Challenge } from '../../../types/models';

interface RiddleChallengeProps {
    challenge: Challenge;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: Challenge) => void;
    onFail: (challenge: Challenge) => void;
    index?: number;
    isBonus?: boolean;
}

const RiddleChallenge: React.FC<RiddleChallengeProps> = ({
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
    const { translateText, forceTranslate } = useTranslation();
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const isDone = isCompleted || isFailed;

    const handleSubmit = async (): Promise<void> => {
        if (!answer.trim() || isDone || isValidating) return;

        setIsValidating(true);
        try {
            const input = answer.trim();
            const correctAnswer = challenge.answer || '';

            // 1. Initial Flexible Match (Fuzzy + Substring)
            if (isFlexibleMatch(input, correctAnswer)) {
                onComplete(challenge);
                return;
            }

            // 2. Translation Fallback (Check if correct in another language)
            
            // Try translating user input to English (common bridge language)
            await forceTranslate(input, 'en');
            const translatedInput = translateText(input, true); // Get translated version from cache
            
            if (translatedInput && translatedInput !== input) {
                if (isFlexibleMatch(translatedInput, correctAnswer)) {
                    onComplete(challenge);
                    return;
                }
            }

            // Also try translating the ANSWER to the user's language and checking
            const userLangAnswer = translateText(correctAnswer, true);
            if (userLangAnswer && userLangAnswer !== correctAnswer) {
                if (isFlexibleMatch(input, userLangAnswer)) {
                    onComplete(challenge);
                    return;
                }
            }

            // If everything fails
            onFail(challenge);
        } catch (error) {
            console.error('Validation failed:', error);
            onFail(challenge);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <ActiveChallengeCard
            title={translateText(challenge.title)}
            points={challenge.points}
            type="trivia"
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handleSubmit}
            actionLabel={t('submitAnswer')}
            disabled={isDone || !answer.trim() || isValidating}
            isLoading={isValidating}
            index={index}
            isBonus={isBonus}
            translateText={challenge.content + (challenge.hint ? '\n\nHint: ' + challenge.hint : '')}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {translateText(challenge.content)}
            </Text>
            <View style={styles.content}>

                {challenge.hint && (
                    <AnimatedPressable
                        onPress={() => setShowHint(!showHint)}
                        style={styles.hintToggle}
                        interactionScale="subtle"
                        haptic="selection"
                    >
                        <Ionicons name={showHint ? "eye-off-outline" : "bulb-outline"} size={20} color={theme.accent} />
                        <Text style={{ color: theme.accent, marginLeft: 4 }}>
                            {showHint ? t('hideHint') : t('showHint')}
                        </Text>
                    </AnimatedPressable>
                )}

                {showHint && challenge.hint && (
                    <View style={[styles.hintBox, { backgroundColor: theme.bgTertiary }]}>
                        <Text style={[styles.hintText, { color: theme.textSecondary }]}>
                            {translateText(challenge.hint)}
                        </Text>
                    </View>
                )}

                {!isDone && (
                    <TextInput
                        style={[styles.input, { color: theme.textPrimary, borderColor: theme.borderPrimary, backgroundColor: theme.bgTertiary }]}
                        placeholder={t('enterAnswer')}
                        placeholderTextColor={theme.textSecondary}
                        value={answer}
                        onChangeText={setAnswer}
                        autoCapitalize="none"
                    />
                )}

                {isFailed && (
                    <View style={styles.feedbackContainer}>
                        <Text style={[styles.feedback, { color: theme.danger }]}>
                            {t('wrongAnswerCorrectWas')} {challenge.answer}
                        </Text>
                    </View>
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
    riddleText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    hintToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    hintBox: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    hintText: {
        fontStyle: 'italic',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 8,
    },
    feedback: {
        marginTop: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    feedbackContainer: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // theme.danger with low opacity
        alignItems: 'center',
    },
    correctAnswer: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
        textAlign: 'center',
    },
});

export default RiddleChallenge;
