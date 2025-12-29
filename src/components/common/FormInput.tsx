import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface FormInputProps {
    label?: string;
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    error?: string;
    keyboardType?: 'default' | 'numeric' | 'email-address';
    description?: string;
}

export function FormInput({
    label,
    value,
    onChange,
    placeholder,
    multiline = false,
    maxLength,
    error,
    keyboardType = 'default',
    description
}: FormInputProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                {label && (
                    <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
                )}
                {maxLength && (
                    <Text style={[
                        styles.charCount,
                        { color: value.length >= maxLength ? theme.danger : theme.textTertiary }
                    ]}>
                        {value.length}/{maxLength}
                    </Text>
                )}
            </View>

            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    {
                        backgroundColor: theme.bgSecondary,
                        borderColor: error ? theme.danger : theme.borderPrimary,
                        color: theme.textPrimary
                    }
                ]}
                placeholder={placeholder}
                placeholderTextColor={theme.textDisabled}
                value={value}
                onChangeText={onChange}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                maxLength={maxLength}
                keyboardType={keyboardType}
            />

            {description && !error && (
                <Text style={[styles.helperText, { color: theme.textTertiary }]}>
                    {description}
                </Text>
            )}

            {error && (
                <Text style={[styles.errorText, { color: theme.danger }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    charCount: {
        fontSize: 12,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 20, // Slightly improved from 24 to 20 for input fields
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    helperText: {
        fontSize: 12,
        marginLeft: 4,
    },
    errorText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    }
});
