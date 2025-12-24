import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ChallengeType } from '@/src/types/models';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface GeneralChallengeInputProps {
    title: string;
    setTitle: (val: string) => void;
    content: string;
    setContent: (val: string) => void;
    hint: string;
    setHint: (val: string) => void;
    type: ChallengeType;
}

export function GeneralChallengeInput({ title, setTitle, content, setContent, hint, setHint, type }: GeneralChallengeInputProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const getQuestionLabel = () => {
        if (type === ChallengeType.RIDDLE) return "The Riddle";
        if (type === ChallengeType.DARE) return "The Dare";
        if (type === ChallengeType.PICTURE) return "What to photograph?";
        if (type === ChallengeType.LOCATION) return "Where exactly?";
        return t('challengeQuestion');
    };

    const getPlaceholder = () => {
        if (type === ChallengeType.PICTURE) return "e.g. Take a selfie with the statue...";
        if (type === ChallengeType.LOCATION) return "e.g. Stand in the center of the square...";
        return "Describe the challenge...";
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{t('challengeTitle')}</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="e.g. Find the Hidden Door"
                    placeholderTextColor={theme.textDisabled}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>{getQuestionLabel()}</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={content}
                    onChangeText={setContent}
                    multiline
                    placeholder={getPlaceholder()}
                    placeholderTextColor={theme.textDisabled}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Hint (Optional)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                    value={hint}
                    onChangeText={setHint}
                    placeholder="Help them out..."
                    placeholderTextColor={theme.textDisabled}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    input: {
        padding: 16,
        borderRadius: 24,
        fontSize: 16,
        fontWeight: '500',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});
