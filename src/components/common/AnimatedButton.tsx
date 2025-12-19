import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { triggerHaptic } from '../../utils/haptics';
import { AnimatedPressable } from './AnimatedPressable';

interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'small' | 'medium' | 'large';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const { theme } = useTheme();

    const getBackgroundColor = () => {
        switch (variant) {
            case 'secondary': return theme.secondary;
            case 'outline': return 'transparent';
            case 'danger': return theme.danger || '#ff4444';
            default: return theme.primary; // Gradient handled separately for primary usually
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
                    {icon && <Ionicons name={icon} size={20} color={getTextColor()} style={{ marginRight: 8 }} />}
                    <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'small' ? 14 : 16 }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </View>
    );

    return (
        <AnimatedPressable
            onPress={handlePress}
            disabled={disabled || loading}
            interactionScale="medium"
            haptic="none" // Handled manually for conditional logic
            style={[
                styles.container,
                variant === 'outline' && { borderWidth: 1, borderColor: theme.borderPrimary },
                { backgroundColor: getBackgroundColor() },
                disabled && { opacity: 0.6 },
                style,
                { borderRadius: 12, overflow: 'hidden' }
            ]}
        >
            {renderContent()}
        </AnimatedPressable>
    );
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
    },
    text: {
        fontWeight: '600',
    }
});
