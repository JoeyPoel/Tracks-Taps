import { GenericCard } from '@/src/components/common/GenericCard';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextComponent } from '../../common/TextComponent'; // Added import

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
        <GenericCard
            onPress={onPress}
            variant="gradient"
            gradientColors={isSelected ? [colors[0] + '20', colors[1] + '10'] : [theme.bgSecondary, theme.bgSecondary]}
            style={[
                styles.card,
                {
                    borderColor: isSelected ? theme.primary : 'transparent',
                    borderWidth: 2,
                }
            ]}
            padding="large"
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? 'white' : theme.bgTertiary }]}>
                    <Ionicons name={icon} size={32} color={isSelected ? colors[0] : theme.textSecondary} />
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={28} color={theme.primary} />
                )}
            </View>

            <View style={styles.cardContent}>
                <TextComponent style={styles.cardTitle} color={theme.textPrimary} bold variant="h3">
                    {label}
                </TextComponent>
                <TextComponent style={styles.cardDesc} color={theme.textSecondary} variant="body">
                    {description}
                </TextComponent>
            </View>
        </GenericCard>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        // Manual shadow since variant is gradient
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
        // fontSize handled by TextComponent
    },
    cardDesc: {
        lineHeight: 22,
    },
});
