import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { AnimatedButton } from './common/AnimatedButton';

interface StartTourButtonProps {
    onPress: () => void;
    buttonText: string;
    disabled?: boolean;
    style?: any;
}

export default function StartTourButton({ onPress, buttonText, disabled, style }: StartTourButtonProps) {
    const { theme } = useTheme();

    return (
        <AnimatedButton
            title={buttonText}
            onPress={onPress}
            disabled={disabled}
            style={style}
            icon="play"
            gradient={true}
            gradientColors={[theme.fixedGradientFrom, theme.fixedGradientTo]}
        />
    );
}
