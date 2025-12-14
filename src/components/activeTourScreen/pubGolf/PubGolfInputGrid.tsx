import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

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
    const { theme } = useTheme();
    const { t } = useLanguage();
    const subTextColor = theme.textSecondary;

    return (
        <View style={styles.glowContainer}>
            <View style={[styles.inputSection, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
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

                        return (
                            <TouchableOpacity
                                key={num}
                                style={[
                                    styles.sipButton,
                                    styles.sipGlow, // Apply general glow properties
                                    {
                                        // Use the defined baseColor for both properties
                                        backgroundColor: baseColor,
                                        shadowColor: baseColor,
                                        borderColor: 'rgba(255,255,255,0.1)',
                                    },
                                    // Apply selected styles which will override base styles if selected
                                    selectedStyles,
                                ]}
                                onPress={() => onSelectSips(num)}
                            >
                                <Text style={[
                                    styles.sipButtonText,
                                    { color: theme.fixedWhite },
                                ]}>{num}</Text>
                            </TouchableOpacity>
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