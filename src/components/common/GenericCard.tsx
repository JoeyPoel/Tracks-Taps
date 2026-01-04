import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from './AnimatedPressable';

interface GenericCardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    variant?: 'elevated' | 'flat' | 'outlined' | 'gradient';
    gradientColors?: readonly [string, string, ...string[]];
    padding?: 'none' | 'small' | 'medium' | 'large';
    haptic?: 'light' | 'medium' | 'selection' | 'success' | 'none';
}

/**
 * A generic card component that provides consistent styling and interaction.
 * automatically handles touch feedback if an onPress is provided.
 */
export const GenericCard: React.FC<GenericCardProps> = ({
    children,
    onPress,
    style,
    variant = 'elevated',
    gradientColors,
    padding = 'medium',
    haptic = 'light',
}) => {
    const { theme } = useTheme();

    const getPadding = () => {
        switch (padding) {
            case 'none': return 0;
            case 'small': return 12;
            case 'large': return 24;
            default: return 16;
        }
    };

    const getBackgroundColor = () => {
        if (variant === 'gradient') return 'transparent';
        return theme.bgSecondary;
    };

    const getBorder = () => {
        if (variant === 'outlined') return { borderWidth: 1, borderColor: theme.borderPrimary };
        return {};
    };

    const getShadow = () => {
        if (variant === 'elevated') {
            return {
                shadowColor: theme.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
            };
        }
        return {};
    };

    // Content wrapper to handle padding and gradient
    const Content = () => {
        const contentStyle = { padding: getPadding() };

        if (variant === 'gradient' && gradientColors) {
            return (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={contentStyle}
                >
                    {children}
                </LinearGradient>
            );
        }

        return <View style={contentStyle}>{children}</View>;
    };

    const containerStyle = [
        styles.container,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getShadow(),
        style,
    ];

    if (onPress) {
        return (
            <AnimatedPressable
                onPress={onPress}
                style={containerStyle as StyleProp<ViewStyle>}
                interactionScale="subtle"
                haptic={haptic}
            >
                <Content />
            </AnimatedPressable>
        );
    }

    return (
        <View style={containerStyle as StyleProp<ViewStyle>}>
            <Content />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden', // Ensures inner content/gradient respects border radius
    },
});
