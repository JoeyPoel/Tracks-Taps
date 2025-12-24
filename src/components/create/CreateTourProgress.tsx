import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CreateTourProgressProps {
    currentStep: number;
    totalSteps: number;
}

export default function CreateTourProgress({ currentStep, totalSteps }: CreateTourProgressProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    // Create an array of step indices
    const steps = Array.from({ length: totalSteps }, (_, i) => i);

    return (
        <View style={styles.container}>
            <View style={styles.stepsRow}>
                {steps.map((index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <View key={index} style={styles.stepItem}>
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: isActive || isCompleted ? theme.primary : theme.borderPrimary,
                                        width: isActive ? 24 : 8,
                                        opacity: (isActive || isCompleted) ? 1 : 0.4
                                    }
                                ]}
                            />
                        </View>
                    );
                })}
            </View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
                {t('step')} {currentStep + 1} <Text style={{ color: theme.textTertiary }}>/ {totalSteps}</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepsRow: {
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    stepItem: {
        justifyContent: 'center',
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    }
});
