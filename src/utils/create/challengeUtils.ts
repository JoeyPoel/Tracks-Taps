import { ChallengeFormState } from '@/src/hooks/create/useChallengeForm';
import { ChallengeType } from '@/src/types/models';

export const validateChallenge = (state: ChallengeFormState, t: (key: string) => string) => {
    const { title, content, type, answer, optionA, optionB, optionC, optionD } = state;

    if (!title || !content) {
        return { valid: false, message: t('fillAllFields'), title: t('missingInfo') };
    }

    if (type === ChallengeType.TRIVIA && (!optionA || !optionB || !optionC || !optionD)) {
        return { valid: false, message: "Please fill in all 4 trivia options.", title: t('missingInfo') };
    }

    if (type === ChallengeType.RIDDLE && !answer) {
        return { valid: false, message: "Please provide an answer for the riddle.", title: t('missingInfo') };
    }

    return { valid: true };
};

export const createChallengePayload = (state: ChallengeFormState) => {
    const { title, content, type, answer, points, hint, tfAnswer, optionA, optionB, optionC, optionD } = state;

    let finalAnswer = answer;
    if (type === ChallengeType.TRUE_FALSE) {
        finalAnswer = tfAnswer ? 'TRUE' : 'FALSE';
    } else if (type === ChallengeType.TRIVIA) {
        finalAnswer = optionA;
    }

    return {
        title,
        content,
        answer: (type === ChallengeType.TRIVIA || type === ChallengeType.RIDDLE || type === ChallengeType.TRUE_FALSE) ? finalAnswer : null,
        options: type === ChallengeType.TRIVIA ? [optionA, optionB, optionC, optionD] : [],
        hint,
        points: parseInt(points) || 0,
        type
    };
};
