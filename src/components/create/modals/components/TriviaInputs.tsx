import { FormInput } from '@/src/components/common/FormInput';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { View } from 'react-native';

interface TriviaInputsProps {
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    setOptionA: (val: string) => void;
    setOptionB: (val: string) => void;
    setOptionC: (val: string) => void;
    setOptionD: (val: string) => void;
}

export function TriviaInputs({ optionA, optionB, optionC, optionD, setOptionA, setOptionB, setOptionC, setOptionD }: TriviaInputsProps) {
    const { theme } = useTheme();

    return (
        <View style={{ gap: 12 }}>
            <FormInput
                label="Correct Answer (Option A)"
                value={optionA}
                onChange={setOptionA}
                placeholder="Type the correct answer here"
                success={true}
            />

            {['B', 'C', 'D'].map((opt, i) => (
                <View key={opt}>
                    <FormInput
                        label={`Incorrect Option ${opt}`}
                        value={i === 0 ? optionB : i === 1 ? optionC : optionD}
                        onChange={i === 0 ? setOptionB : i === 1 ? setOptionC : setOptionD}
                        placeholder={`Option ${opt}`}
                    />
                </View>
            ))}
        </View>
    );
}


