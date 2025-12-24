import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface RiddleInputProps {
    value: string;
    onChange: (val: string) => void;
}

export function RiddleInput({ value, onChange }: RiddleInputProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>The Answer</Text>
            <TextInput
                style={[styles.input, { backgroundColor: theme.bgSecondary, color: theme.textPrimary }]}
                value={value}
                onChangeText={onChange}
                placeholder="What is the answer?"
                placeholderTextColor={theme.textDisabled}
            />
        </View>
    );
}

const styles = StyleSheet.create({
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
});
