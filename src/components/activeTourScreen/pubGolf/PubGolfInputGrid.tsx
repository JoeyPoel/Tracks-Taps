import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    const subTextColor = theme.textSecondary;

    return (
        <View style={styles.inputSection}>
            <Text style={[styles.inputLabel, { color: subTextColor }]}>
                Sips taken:
            </Text>
            <View style={styles.grid}>
                {Array.from({ length: par + 3 }, (_, i) => i + 1).map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={[
                            styles.sipButton,
                            {
                                backgroundColor: num === par ? theme.gold :
                                    num < par ? theme.success :
                                        theme.bgPrimary,
                                borderColor: 'rgba(255,255,255,0.1)'
                            },
                            selectedSips === num && { backgroundColor: theme.primary, borderColor: theme.primary },
                        ]}
                        onPress={() => onSelectSips(num)}
                    >
                        <Text style={[
                            styles.sipButtonText,
                            { color: theme.textPrimary },
                            selectedSips === num && { color: '#FFF' }
                        ]}>{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
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
    sipButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
