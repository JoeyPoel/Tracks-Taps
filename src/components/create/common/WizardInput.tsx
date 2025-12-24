import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface WizardInputProps {
    label: string;
    value: string;
    onChange: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}

export function WizardInput({ label, value, onChange, placeholder, multiline = false, keyboardType = 'default' }: WizardInputProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    {
                        backgroundColor: theme.bgSecondary,
                        borderColor: theme.borderPrimary,
                        color: theme.textPrimary
                    }
                ]}
                placeholder={placeholder}
                placeholderTextColor={theme.textDisabled}
                value={value}
                onChangeText={onChange}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                keyboardType={keyboardType}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    input: {
        borderWidth: 0,
        borderRadius: 24,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
});
