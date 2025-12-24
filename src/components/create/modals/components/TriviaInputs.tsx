import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
            <Text style={[styles.label, { color: theme.textSecondary }]}>Options</Text>

            <View>
                <Text style={[styles.microLabel, { color: theme.success }]}>Correct Answer (Option A)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: theme.bgSecondary, borderColor: theme.success, borderWidth: 1, color: theme.textPrimary }]}
                    value={optionA}
                    onChangeText={setOptionA}
                    placeholder="Type the correct answer here"
                    placeholderTextColor={theme.textDisabled}
                />
            </View>

            {['B', 'C', 'D'].map((opt, i) => (
                <View key={opt}>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                        value={i === 0 ? optionB : i === 1 ? optionC : optionD}
                        onChangeText={i === 0 ? setOptionB : i === 1 ? setOptionC : setOptionD}
                        placeholder={`Incorrect Option ${opt}`}
                        placeholderTextColor={theme.textDisabled}
                    />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    microLabel: {
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        padding: 16,
        borderRadius: 24,
        fontSize: 16,
        fontWeight: '500',
    },
});
