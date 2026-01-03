import { FormInput } from '@/src/components/common/FormInput';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TriviaInputsProps {
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    setOptionA: (val: string) => void;
    setOptionB: (val: string) => void;
    setOptionC: (val: string) => void;
    setOptionD: (val: string) => void;
    correctOption: 'A' | 'B' | 'C' | 'D';
    setCorrectOption: (val: 'A' | 'B' | 'C' | 'D') => void;
}

export function TriviaInputs({ optionA, optionB, optionC, optionD, setOptionA, setOptionB, setOptionC, setOptionD, correctOption, setCorrectOption }: TriviaInputsProps) {
    const { theme } = useTheme();

    const renderOption = (label: string, value: string, setValue: (val: string) => void, optionKey: 'A' | 'B' | 'C' | 'D') => {
        const isCorrect = correctOption === optionKey;

        return (
            <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600' }}>{label}</Text>
                    <TouchableOpacity
                        onPress={() => setCorrectOption(optionKey)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                        <Ionicons
                            name={isCorrect ? "radio-button-on" : "radio-button-off"}
                            size={20}
                            color={isCorrect ? theme.success : theme.textSecondary}
                        />
                        <Text style={{ color: isCorrect ? theme.success : theme.textSecondary, fontSize: 12 }}>
                            {isCorrect ? 'Correct Answer' : 'Mark as Correct'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <FormInput
                    value={value}
                    onChange={setValue}
                    placeholder={`Enter option ${optionKey}`}
                    success={isCorrect}
                />
            </View>
        );
    };

    return (
        <View style={{ gap: 16 }}>
            {renderOption("Option A", optionA, setOptionA, 'A')}
            {renderOption("Option B", optionB, setOptionB, 'B')}
            {renderOption("Option C", optionC, setOptionC, 'C')}
            {renderOption("Option D", optionD, setOptionD, 'D')}
        </View>
    );
}


