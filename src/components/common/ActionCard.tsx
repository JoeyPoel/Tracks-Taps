import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AnimatedPressable } from './AnimatedPressable'; // Ensure this path is correct
import { TextComponent } from './TextComponent';

interface ActionCardProps {
    title: string;
    subtitle?: string;
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    rightAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
        color?: string;
    };
    variant?: 'default' | 'primary';
    style?: any;
}

export function ActionCard({ title, subtitle, icon, onPress, rightAction, variant = 'default', style }: ActionCardProps) {
    const { theme } = useTheme();

    const isPrimary = variant === 'primary';
    const bg = isPrimary ? theme.primary : theme.bgSecondary;
    const contentColor = isPrimary ? '#FFFFFF' : theme.textPrimary;
    const subColor = isPrimary ? 'rgba(255,255,255,0.8)' : theme.textSecondary;

    return (
        <AnimatedPressable
            style={[styles.container, { backgroundColor: bg }, style]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : theme.bgTertiary }]}>
                <Ionicons name={icon} size={24} color={contentColor} />
            </View>

            <View style={styles.textContainer}>
                <TextComponent style={styles.title} color={contentColor} bold variant="body">
                    {title}
                </TextComponent>
                {subtitle && (
                    <TextComponent style={styles.subtitle} color={subColor} variant="caption">
                        {subtitle}
                    </TextComponent>
                )}
            </View>

            {rightAction ? (
                <AnimatedPressable
                    style={[styles.actionButton, { backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : theme.bgTertiary }]}
                    onPress={rightAction.onPress}
                >
                    <Ionicons name={rightAction.icon} size={20} color={rightAction.color || contentColor} />
                </AnimatedPressable>
            ) : (
                <Ionicons name="chevron-forward" size={20} color={contentColor} style={{ opacity: 0.5 }} />
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 16,
    },
    subtitle: {
        fontSize: 12,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
