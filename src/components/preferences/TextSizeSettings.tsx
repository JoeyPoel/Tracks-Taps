import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { TextComponent } from '../common/TextComponent';

interface TextSizeSettingsProps {
    fontScale: 'smallest' | 'small' | 'normal' | 'large' | 'largest';
    setFontScale: (scale: 'smallest' | 'small' | 'normal' | 'large' | 'largest') => void;
    theme: any;
    t: (key: any) => string;
}

export const TextSizeSettings: React.FC<TextSizeSettingsProps> = ({
    fontScale,
    setFontScale,
    theme,
    t
}) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, padding: 16 }]}>
            <TextComponent color={theme.textSecondary} variant="caption" style={{ marginBottom: 12 }}>
                {t('textSizeDesc')}
            </TextComponent>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                    { id: 'smallest' as const, label: t('smallest') },
                    { id: 'small' as const, label: t('small') },
                    { id: 'normal' as const, label: t('normal') },
                    { id: 'large' as const, label: t('large') },
                    { id: 'largest' as const, label: t('largest') },
                ].map((opt) => {
                    const isActive = fontScale === opt.id;
                    const previewSize =
                        opt.id === 'smallest' ? 10 :
                            opt.id === 'small' ? 12 :
                                opt.id === 'normal' ? 14 :
                                    opt.id === 'large' ? 17 : 21;
                    return (
                        <Pressable
                            key={opt.id}
                            onPress={() => setFontScale(opt.id)}
                            style={{
                                flex: 1,
                                paddingVertical: 10,
                                paddingHorizontal: 4,
                                borderRadius: 10,
                                backgroundColor: isActive ? theme.primary + '15' : theme.bgPrimary,
                                alignItems: 'center',
                                borderWidth: isActive ? 1.5 : 1,
                                borderColor: isActive ? theme.primary : theme.borderSecondary,
                                gap: 2,
                            }}
                        >
                            <TextComponent
                                color={isActive ? theme.primary : theme.textSecondary}
                                bold={isActive}
                                size={previewSize}
                            >
                                Aa
                            </TextComponent>
                            <TextComponent
                                color={isActive ? theme.primary : theme.textPrimary}
                                bold={isActive}
                                style={{ fontSize: 9 }}
                            >
                                {opt.label}
                            </TextComponent>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        marginBottom: 24,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    }
});
