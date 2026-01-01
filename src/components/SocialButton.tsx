import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { AnimatedButton } from './common/AnimatedButton';

interface SocialButtonProps {
    text: string;
    onPress: () => void;
    icon?: 'google' | 'apple' | 'facebook'; // add more as needed
    loading?: boolean;
}

export default function SocialButton({ text, onPress, icon, loading }: SocialButtonProps) {
    const { theme } = useTheme();

    // Map specific social icons to Ionicons glyphs if needed, or pass directly
    const getIconName = (): keyof typeof Ionicons.glyphMap | undefined => {
        if (icon === 'google') return 'logo-google';
        if (icon === 'apple') return 'logo-apple';
        if (icon === 'facebook') return 'logo-facebook';
        return undefined;
    };

    return (
        <AnimatedButton
            title={text}
            onPress={onPress}
            loading={loading}
            variant="outline"
            icon={getIconName()}
            style={{
                marginBottom: 16,
                backgroundColor: theme.bgSecondary,
                borderColor: theme.borderPrimary,
                height: 56
            }}
            textStyle={{
                color: theme.textPrimary,
                fontSize: 16
            }}
        />
    );
}
