import { useLanguage } from '@/src/context/LanguageContext';
import { ChallengeType } from '@/src/types/models';
import { createChallengePayload, validateChallenge } from '@/src/utils/create/challengeUtils';
import { useEffect, useState } from 'react';
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
    correctOption: 'A' | 'B' | 'C' | 'D'; // New field
}

export function useChallengeForm(onSave: (challenge: any) => void, onClose: () => void, initialData?: any) {
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
        correctOption: 'A', // Default to A
    });

    useEffect(() => {
        if (initialData) {
            // Determine correct option if editing
            let correct = 'A';
            if (initialData.type === ChallengeType.TRIVIA && initialData.answer) {
                if (initialData.answer === initialData.options?.[1]) correct = 'B';
                if (initialData.answer === initialData.options?.[2]) correct = 'C';
                if (initialData.answer === initialData.options?.[3]) correct = 'D';
            }

            setFormState({
                title: initialData.title || '',
                content: initialData.content || '',
                answer: initialData.answer || '',
                points: initialData.points ? String(initialData.points) : '50',
                hint: initialData.hint || '',
                type: initialData.type || ChallengeType.TRIVIA,
                tfAnswer: initialData.type === ChallengeType.TRUE_FALSE ? initialData.answer === 'true' : true,
                optionA: initialData.options?.[0] || '',
                optionB: initialData.options?.[1] || '',
                optionC: initialData.options?.[2] || '',
                optionD: initialData.options?.[3] || '',
                correctOption: correct as 'A' | 'B' | 'C' | 'D',
            });
        } else {
            resetForm();
        }
    }, [initialData]);

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
            correctOption: 'A',
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
