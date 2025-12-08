import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import ActiveChallengeCard from '../ActiveChallengeCard';

import { Challenge } from '../../../types/models';

interface RiddleChallengeProps {
    challenge: Challenge;
    isCompleted: boolean;
    isFailed: boolean;
    onComplete: (challenge: Challenge) => void;
    onFail: (challenge: Challenge) => void;
}

const RiddleChallenge: React.FC<RiddleChallengeProps> = ({
    challenge,
    isCompleted,
    isFailed,
    onComplete,
    onFail
}) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [answer, setAnswer] = useState('');
    const [showHint, setShowHint] = useState(false);
    const isDone = isCompleted || isFailed;

    const handleSubmit = () => {
        if (!answer.trim() || isDone) return;

        const normalizedInput = answer.trim().toLowerCase();
        const normalizedAnswer = challenge.answer?.toLowerCase();

        if (normalizedInput === normalizedAnswer) {
            onComplete(challenge);
        } else {
            // Maybe allow multiple tries? For now fail
            // Or give feedback without failing immediately? 
            // Requirement said "True or false challenges ... UI differnt", Riddle wasn't spec'd to fail immediately but let's assume one try or loose try.
            // Actually riddles usually allow retry. Let's fail for now to match interface, or maybe just show error toast.
            // Let's implement it as: if wrong, just shake/error message, don't permanent fail unless attempts exhausted.
            // But existing logic seemed to be 'fail' on wrong answer for trivia.
            // I'll stick to fail for consistency with existing system, but maybe add a warning.
            onFail(challenge);
        }
    };

    return (
        <ActiveChallengeCard
            title={challenge.title}
            points={challenge.points}
            description={challenge.description}
            type="trivia" // Use trivia style
            isCompleted={isCompleted}
            isFailed={isFailed}
            onPress={handleSubmit}
            actionLabel={t('submitAnswer') || "Submit"}
            disabled={isDone || !answer.trim()}
        >
            <View style={styles.content}>
                <Text style={[styles.riddleText, { color: theme.textPrimary }]}>
                    {challenge.content}
                </Text>

                {challenge.hint && (
                    <TouchableOpacity
                        onPress={() => setShowHint(!showHint)}
                        style={styles.hintToggle}
                    >
                        <Ionicons name={showHint ? "eye-off-outline" : "bulb-outline"} size={20} color={theme.accent} />
                        <Text style={{ color: theme.accent, marginLeft: 4 }}>
                            {showHint ? (t('hideHint') || "Hide Hint") : (t('showHint') || "Need a hint?")}
                        </Text>
                    </TouchableOpacity>
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
                        placeholder={t('enterAnswer') || "Enter your answer..."}
                        placeholderTextColor={theme.textSecondary}
                        value={answer}
                        onChangeText={setAnswer}
                        autoCapitalize="none"
                    />
                )}

                {isFailed && (
                    <View>
                        <Text style={[styles.feedback, { color: theme.danger }]}>
                            {t('wrongAnswer') || "That's not it!"}
                        </Text>
                        <Text style={{ color: theme.danger, marginTop: 4, fontWeight: 'bold', textAlign: 'center' }}>
                            {t('correctAnswerWas') || "Answer:"} {challenge.answer}
                        </Text>
                    </View>
                )}
            </View>
        </ActiveChallengeCard>
    );
};

const styles = StyleSheet.create({
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
