import { FormInput } from '@/src/components/common/FormInput';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';

interface RiddleInputProps {
    value: string;
    onChange: (val: string) => void;
}

export function RiddleInput({ value, onChange }: RiddleInputProps) {
    const { theme } = useTheme();

    return (
        <FormInput
            label="The Answer"
            value={value}
            onChange={onChange}
            placeholder="What is the answer?"
        />
    );
}


