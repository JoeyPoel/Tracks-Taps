import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { triggerHaptic } from '../../utils/haptics';
import { AnimatedPressable } from './AnimatedPressable';
import { TextComponent } from './TextComponent'; // Added import

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    gradient?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    iconColor,
    loading = false,
    disabled = false,
    style,
    textStyle,
    gradient = false,
    gradientColors,
}) => {
    const { theme } = useTheme();

    const getBackgroundColor = () => {
        if (gradient) return 'transparent'; // Handled by LinearGradient
        switch (variant) {
            case 'secondary': return theme.secondary;
            case 'outline': return 'transparent';
            case 'danger': return theme.danger || '#ff4444';
            default: return theme.primary;
        }
    };

    const getTextColor = () => {
        if (variant === 'outline') return theme.textPrimary;
        return theme.fixedWhite;
    };

    const getHeight = () => {
        switch (size) {
            case 'small': return 36;
            case 'large': return 56;
            default: return 48;
        }
    };

    const handlePress = () => {
        if (loading || disabled) return;
        if (variant === 'primary' || variant === 'danger') {
            triggerHaptic('light'); // Standard feedback for main actions
        } else {
            triggerHaptic('selection'); // Subtle feedback for secondary actions
        }
        onPress();
    };

    // Render content based on variant
    const renderContent = () => (
        <View style={[styles.contentContainer, { height: getHeight() }]}>
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={20} color={iconColor || getTextColor()} style={{ marginRight: 8 }} />}
                    <TextComponent
                        style={[styles.text, textStyle]}
                        color={getTextColor()}
                        size={size === 'small' ? 14 : 16}
                        bold
                        variant="label"
                    >
                        {title}
                    </TextComponent>
                </>
            )}
        </View>
    );

    const buttonContent = (
        <AnimatedPressable
            onPress={handlePress}
            disabled={disabled || loading}
            interactionScale="medium"
            haptic="none"
            style={[
                styles.container,
                variant === 'outline' && { borderWidth: 1, borderColor: theme.borderPrimary },
                { backgroundColor: getBackgroundColor() },
                disabled && { opacity: 0.6 },
                style,
                { borderRadius: 12, overflow: 'hidden' } // Ensure border radius clips gradient
            ]}
        >
            {gradient && gradientColors ? (
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            ) : null}
            {renderContent()}
        </AnimatedPressable>
    );

    return buttonContent;
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        width: '100%',
        zIndex: 1, // Ensure content sits above gradient
    },
    text: {
        // handled by TextComponent
    }
});
