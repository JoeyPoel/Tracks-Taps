import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ModeCardProps {
    mode: string;
    icon: any;
    label: string;
    description: string;
    colors: string[];
    isSelected: boolean;
    onPress: () => void;
}

export function ModeCard({ mode, icon, label, description, colors, isSelected, onPress }: ModeCardProps) {
    const { theme } = useTheme();

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: theme.bgSecondary,
                    borderColor: isSelected ? theme.primary : 'transparent',
                    borderWidth: 2,
                }
            ]}
        >
            <LinearGradient
                colors={isSelected ? [colors[0] + '20', colors[1] + '10'] : [theme.bgSecondary, theme.bgSecondary]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? 'white' : theme.bgTertiary }]}>
                    <Ionicons name={icon} size={32} color={isSelected ? colors[0] : theme.textSecondary} />
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={28} color={theme.primary} />
                )}
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{label}</Text>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{description}</Text>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        gap: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    cardDesc: {
        fontSize: 15,
        lineHeight: 22,
    },
});
