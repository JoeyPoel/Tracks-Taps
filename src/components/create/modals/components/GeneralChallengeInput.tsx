import { FormInput } from '@/src/components/common/FormInput';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { ChallengeType } from '@/src/types/models';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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
        if (type === ChallengeType.RIDDLE) return t('challengeQuestionRiddle');
        if (type === ChallengeType.DARE) return t('challengeQuestionDare');
        if (type === ChallengeType.PICTURE) return t('challengeQuestionPicture');
        if (type === ChallengeType.LOCATION) return t('challengeQuestionLocation');
        return t('challengeQuestion');
    };

    const getPlaceholder = () => {
        if (type === ChallengeType.PICTURE) return t('challengePlaceholderPicture');
        if (type === ChallengeType.LOCATION) return t('challengePlaceholderLocation');
        return t('challengePlaceholderDefault');
    };

    return (
        <View style={styles.container}>
            <FormInput
                label={t('challengeTitle')}
                value={title}
                onChange={setTitle}
                placeholder={t('challengeTitlePlaceholder')}
                maxLength={50}
            />

            <FormInput
                label={getQuestionLabel()}
                value={content}
                onChange={setContent}
                multiline
                placeholder={getPlaceholder()}
                maxLength={250}
            />

            <FormInput
                label={t('hintOptional')}
                value={hint}
                onChange={setHint}
                placeholder={t('hintPlaceholder')}
                maxLength={100}
            />
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
