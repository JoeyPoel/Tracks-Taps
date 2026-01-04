import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TextComponentProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: string;
    bold?: boolean;
    center?: boolean;
    size?: number;
}

/**
 * A wrapper around React Native's Text component that:
 * 1. Handles dynamic type scaling (accessibility).
 * 2. Uses theme colors by default.
 * 3. Provides standardized typography variants.
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

    const getVariantStyle = (): TextStyle => {
        switch (variant) {
            case 'h1':
                return { fontSize: 32, fontWeight: '700', lineHeight: 40 };
            case 'h2':
                return { fontSize: 24, fontWeight: '700', lineHeight: 32 };
            case 'h3':
                return { fontSize: 20, fontWeight: '600', lineHeight: 28 };
            case 'body':
                return { fontSize: 16, lineHeight: 24 };
            case 'label':
                return { fontSize: 14, fontWeight: '500', lineHeight: 20 };
            case 'caption':
                return { fontSize: 12, lineHeight: 16 };
            default:
                return { fontSize: 16 };
        }
    };

    const baseStyle: TextStyle = {
        color: color || theme.textPrimary,
        textAlign: center ? 'center' : 'auto',
        fontWeight: bold ? '700' : undefined,
    };

    // Override size if provided
    const dynamicStyle = size ? { fontSize: size } : {};

    return (
        <Text
            style={[getVariantStyle(), baseStyle, dynamicStyle, style]}
            allowFontScaling={true} // Explicitly ensure this is true
            // We can set maxFontSizeMultiplier to prevent UI breaking too much if needed,
            // but for full accessibility it's better to let it scale and fix layouts.
            // maxFontSizeMultiplier={2} 
            {...props}
        >
            {children}
        </Text>
    );
};
