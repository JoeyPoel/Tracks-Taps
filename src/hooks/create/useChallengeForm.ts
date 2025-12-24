import { useLanguage } from '@/src/context/LanguageContext';
import { ChallengeType } from '@/src/types/models';
import { createChallengePayload, validateChallenge } from '@/src/utils/create/challengeUtils';
import { useState } from 'react';
import { Alert } from 'react-native';

export interface ChallengeFormState {
    title: string;
    content: string;
    answer: string;
    points: string;
    hint: string;
    type: ChallengeType;
    tfAnswer: boolean;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
}

export function useChallengeForm(onSave: (challenge: any) => void, onClose: () => void) {
    const { t } = useLanguage();

    const [formState, setFormState] = useState<ChallengeFormState>({
        title: '',
        content: '',
        answer: '',
        points: '50',
        hint: '',
        type: ChallengeType.TRIVIA,
        tfAnswer: true,
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
    });

    const updateField = <K extends keyof ChallengeFormState>(key: K, value: ChallengeFormState[K]) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        setFormState({
            title: '',
            content: '',
            answer: '',
            points: '50',
            hint: '',
            type: ChallengeType.TRIVIA,
            tfAnswer: true,
            optionA: '',
            optionB: '',
            optionC: '',
            optionD: '',
        });
    };

    const handleSave = () => {
        const validation = validateChallenge(formState, t as any);
        if (!validation.valid && validation.message && validation.title) {
            Alert.alert(validation.title, validation.message);
            return;
        }

        onSave(createChallengePayload(formState));
        resetForm();
    };

    return {
        formState,
        updateField,
        handleSave,
        resetForm
    };
}
