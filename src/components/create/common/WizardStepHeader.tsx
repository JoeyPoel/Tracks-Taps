import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextComponent } from '../../common/TextComponent';

interface WizardStepHeaderProps {
    title: string;
    subtitle: string;
}

export function WizardStepHeader({ title, subtitle }: WizardStepHeaderProps) {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h2">
                {title}
            </TextComponent>
            <TextComponent style={styles.subtitle} color={theme.textSecondary} variant="body">
                {subtitle}
            </TextComponent>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
        gap: 8,
    },
    title: {
        lineHeight: 34,
    },
    subtitle: {
        // fontSize handled by TextComponent
    },
});
