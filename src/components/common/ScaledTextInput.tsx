import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';
import { useStore } from '../../store/store';

const SCALE_MULTIPLIERS: Record<string, number> = {
    smallest: 0.75,
    small: 0.87,
    normal: 1.0,
    large: 1.15,
    largest: 1.3,
};

/**
 * A drop-in replacement for React Native's TextInput that automatically scales
 * its fontSize according to the user's fontScale accessibility preference.
 * Use this anywhere you would use <TextInput> directly.
 */
export const ScaledTextInput: React.FC<TextInputProps> = ({ style, ...props }) => {
    const fontScale = useStore(state => state.fontScale);
    const multiplier = SCALE_MULTIPLIERS[fontScale] ?? 1.0;

    const flatStyle = StyleSheet.flatten(style) as any;
    const baseFontSize = flatStyle?.fontSize ?? 16;

    const scaledStyle = {
        ...flatStyle,
        fontSize: Math.round(baseFontSize * multiplier),
    };

    return (
        <TextInput
            style={scaledStyle}
            allowFontScaling={false}
            {...props}
        />
    );
};
