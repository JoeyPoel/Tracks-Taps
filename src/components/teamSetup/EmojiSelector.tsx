import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TEAM_EMOJIS } from '../../utils/teamUtils';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface EmojiSelectorProps {
    selectedEmoji: string;
    onSelect: (emoji: string) => void;
}

export const EmojiSelector: React.FC<EmojiSelectorProps> = ({ selectedEmoji, onSelect }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <TextComponent style={styles.label} color={theme.textPrimary} bold variant="h3">{t('teamEmoji')}</TextComponent>
            <View style={styles.grid}>
                {TEAM_EMOJIS.map(emoji => (
                    <AnimatedPressable
                        key={emoji}
                        style={[
                            styles.option,
                            { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary },
                            selectedEmoji === emoji && { borderColor: theme.primary, borderWidth: 2 }
                        ]}
                        onPress={() => onSelect(emoji)}
                        interactionScale="subtle"
                        haptic="selection"
                    >
                        <TextComponent style={{ fontSize: 24 }}>{emoji}</TextComponent>
                    </AnimatedPressable>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    option: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
