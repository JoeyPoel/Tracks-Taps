import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WizardStepHeaderProps {
    title: string;
    subtitle: string;
}

export function WizardStepHeader({ title, subtitle }: WizardStepHeaderProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        gap: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
    },
    subtitle: {
        fontSize: 16,
    },
});
