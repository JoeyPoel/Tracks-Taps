import { FormInput } from '@/src/components/common/FormInput';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';

interface RiddleInputProps {
    value: string;
    onChange: (val: string) => void;
}

export function RiddleInput({ value, onChange }: RiddleInputProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <FormInput
            label={t('theAnswer')}
            value={value}
            onChange={onChange}
            placeholder={t('riddleAnswerPlaceholder')}
        />
    );
}


