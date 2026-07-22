import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useStore } from '../../store/store';

interface TextComponentProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: string;
    bold?: boolean;
    center?: boolean;
    size?: number;
}

/** Multipliers for each font scale setting. */
const SCALE_MULTIPLIERS: Record<string, number> = {
    smallest: 0.75,
    small: 0.87,
    normal: 1.0,
    large: 1.15,
    largest: 1.3,
};

/**
 * A wrapper around React Native's Text component that:
 * 1. Uses theme colors by default.
 * 2. Provides standardized typography variants.
 * 3. Scales ALL font sizes (variant, size prop, AND consumer style) via the
 *    user's fontScale preference. Consumer styles are flattened so that even
 *    hardcoded `fontSize` values in StyleSheet objects get scaled automatically.
 */
export const TextComponent: React.FC<TextComponentProps> = ({
    style,
    variant = 'body',
    color,
    bold,
    center,
    size,
    children,
    ...props
}) => {
    const { theme } = useTheme();
    const fontScale = useStore(state => state.fontScale);
    const dyslexicMode = useStore(state => state.dyslexicMode);
    const multiplier = SCALE_MULTIPLIERS[fontScale] ?? 1.0;

    const getVariantStyle = (): TextStyle => {
        const variantStyle: TextStyle = (() => {
            switch (variant) {
                case 'h1':
                    return { fontSize: Math.round(32 * multiplier), fontWeight: '700', lineHeight: Math.round(40 * multiplier) };
                case 'h2':
                    return { fontSize: Math.round(24 * multiplier), fontWeight: '700', lineHeight: Math.round(32 * multiplier) };
                case 'h3':
                    return { fontSize: Math.round(20 * multiplier), fontWeight: '600', lineHeight: Math.round(28 * multiplier) };
                case 'body':
                    return { fontSize: Math.round(16 * multiplier), lineHeight: Math.round(24 * multiplier) };
                case 'label':
                    return { fontSize: Math.round(14 * multiplier), fontWeight: '500', lineHeight: Math.round(20 * multiplier) };
                case 'caption':
                    return { fontSize: Math.round(12 * multiplier), lineHeight: Math.round(16 * multiplier) };
                default:
                    return { fontSize: Math.round(16 * multiplier) };
            }
        })();

        if (dyslexicMode) {
            delete variantStyle.lineHeight;
        }
        return variantStyle;
    };

    const baseStyle: TextStyle = {
        color: color || theme.textPrimary,
        textAlign: center ? 'center' : 'auto',
        fontWeight: bold ? '700' : undefined,
        fontFamily: dyslexicMode ? 'OpenDyslexic' : undefined,
    };

    // Override size if provided — also scale it
    const dynamicStyle: TextStyle = size ? { fontSize: Math.round(size * multiplier) } : {};

    // Flatten the consumer's style so we can intercept and scale any fontSize in it.
    // This means that even StyleSheet.create objects with hardcoded fontSize values
    // will be scaled automatically — no changes needed in consumer components.
    const flatConsumerStyle = StyleSheet.flatten(style) as TextStyle | undefined;
    const scaledConsumerStyle: TextStyle | undefined = flatConsumerStyle?.fontSize != null
        ? { ...flatConsumerStyle, fontSize: Math.round(flatConsumerStyle.fontSize * multiplier) }
        : flatConsumerStyle;

    return (
        <Text
            style={[getVariantStyle(), baseStyle, dynamicStyle, scaledConsumerStyle]}
            allowFontScaling={false} // We handle scaling ourselves via fontScale setting
            {...props}
        >
            {children}
        </Text>
    );
};
