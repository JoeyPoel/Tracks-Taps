import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { AnimatedPressable } from '../../common/AnimatedPressable';
import ActiveChallengeCard from '../ActiveChallengeCard';

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
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const isDone = isCompleted || isFailed;

    const handleSubmit = (): void => {
        if (!answer.trim() || isDone) return;

        const normalizedInput = answer.trim().toLowerCase();
        const normalizedAnswer = challenge.answer?.toLowerCase();

        if (normalizedInput === normalizedAnswer) {
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
            actionLabel={t('submitAnswer')}
            disabled={isDone || !answer.trim()}
            index={index}
            isBonus={isBonus}
        >
            <Text style={[styles.description, { color: theme.textPrimary }]}>
                {challenge.content}
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
                            {challenge.hint}
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
                    <View>
                        <Text style={[styles.feedback, { color: theme.danger }]}>
                            {t('wrongAnswer')}
                        </Text>
                        <Text style={{ color: theme.danger, marginTop: 4, fontWeight: 'bold', textAlign: 'center' }}>
                            {t('correctAnswerWas')} {challenge.answer}
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
    }
});

export default RiddleChallenge;
