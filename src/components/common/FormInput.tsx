import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TextComponent } from './TextComponent'; // Added import

interface FormInputProps {
    label?: string;
    value: string;
    onChange: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    maxLength?: number;
    error?: string;
    success?: boolean;
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
    success,
    keyboardType = 'default',
    description
}: FormInputProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                {label && (
                    <TextComponent style={styles.label} color={theme.textSecondary} bold variant="label">{label}</TextComponent>
                )}
                {maxLength && (
                    <TextComponent style={styles.charCount} color={value.length >= maxLength ? theme.danger : theme.textTertiary} variant="caption">
                        {value.length}/{maxLength}
                    </TextComponent>
                )}
            </View>

            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textArea,
                    {
                        backgroundColor: theme.bgSecondary,
                        borderColor: error ? theme.danger : success ? theme.success : theme.borderPrimary,
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
                <TextComponent style={styles.helperText} color={theme.textTertiary} variant="caption">
                    {description}
                </TextComponent>
            )}

            {error && (
                <TextComponent style={styles.errorText} color={theme.danger} bold variant="caption">
                    {error}
                </TextComponent>
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
        textTransform: 'uppercase',
    },
    charCount: {
        // handled
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
        marginLeft: 4,
    },
    errorText: {
        marginLeft: 4,
    }
});
