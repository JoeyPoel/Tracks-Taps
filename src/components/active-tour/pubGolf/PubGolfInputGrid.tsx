import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import { AnimatedPressable } from '../../common/AnimatedPressable';

interface PubGolfInputGridProps {
    par: number;
    selectedSips: number | null;
    onSelectSips: (sips: number) => void;
}

export default function PubGolfInputGrid({
    par,
    selectedSips,
    onSelectSips,
}: PubGolfInputGridProps) {
    const { theme, mode } = useTheme();
    const { t } = useLanguage();
    const subTextColor = theme.textSecondary;

    const isLight = mode === 'light';

    return (
        <View style={styles.glowContainer}>
            <View style={[styles.inputSection, { borderTopColor: isLight ? theme.borderPrimary : 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.inputLabel, { color: subTextColor }]}>
                    {t('sipsTaken')}
                </Text>
                <View style={styles.grid}>
                    {Array.from({ length: par + 3 }, (_, i) => i + 1).map((num) => {
                        // --- DEFINE THE BASE COLOR ONCE ---
                        const baseColor = num === par
                            ? theme.pubGolf.par[1] // Use PubGolf Blue (Par Color)
                            : num < par
                                ? theme.pubGolf.birdie[1] // Use PubGolf Green (Birdie Color)
                                : theme.pubGolfInput;

                        // --- DEFINE THE SELECTED COLOR ONCE ---
                        const selectedStyles = selectedSips === num
                            ? {
                                backgroundColor: theme.primary,
                                borderColor: theme.primary,
                                shadowColor: theme.primary,
                            }
                            : {};

                        // Calculate dynamic haptic type based on performance relative to par
                        const getSipHapticType = (val: number, parVal: number) => {
                            if (val === 1) return 'success'; // Hole-in-one is always success
                            const diff = val - parVal;
                            if (diff < 0) return 'heavy'; // Under par
                            if (diff === 0) return 'medium'; // Par
                            if (diff === 1) return 'light'; // Bogey
                            if (diff === 2) return 'warning'; // Double bogey
                            return 'error'; // Triple bogey+
                        };

                        return (
                            <AnimatedPressable
                                key={num}
                                style={[
                                    styles.sipButton,
                                    styles.sipGlow, // Apply general glow properties
                                    {
                                        // Use the defined baseColor for both properties
                                        backgroundColor: baseColor,
                                        shadowColor: baseColor,
                                        borderColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
                                        shadowOpacity: isLight ? 0.1 : 0.3,
                                    },
                                    // Apply selected styles which will override base styles if selected
                                    selectedStyles,
                                ]}
                                onPress={() => onSelectSips(num)}
                                interactionScale="medium"
                                haptic={getSipHapticType(num, par)}
                            >
                                <Text style={[
                                    styles.sipButtonText,
                                    { color: (isLight && num > par) ? theme.textPrimary : theme.fixedWhite },
                                ]}>{num}</Text>
                            </AnimatedPressable>
                        );
                    })}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    glowContainer: {
        paddingBottom: 20,
    },
    inputSection: {
        marginTop: 20,
        borderTopWidth: 1,
        paddingTop: 16,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    sipButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    sipGlow: {
        // General Shadow/Glow Properties
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        // Glow effect for Android
        elevation: 10,
    },
    sipButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});