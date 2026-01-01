import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface TourCodeDisplayProps {
    code: string;
}

export const TourCodeDisplay = ({ code }: TourCodeDisplayProps) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const displayCode = `${code}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(code.toString()); // Copy just the number or the full code? Design says TOUR-ULWVR9. Let's copy display code.
        // Actually, let's copy the display code for better UX sharing
        await Clipboard.setStringAsync(displayCode);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary, borderColor: theme.accent }]}>
            <View style={styles.header}>
                <Ionicons name="sparkles" size={20} color={theme.accent} style={{ marginRight: 8 }} />
                <TextComponent style={styles.label} color={theme.accent} bold variant="body">{t('tourCodeLabel')}</TextComponent>
            </View>

            <TextComponent style={styles.description} color={theme.textSecondary} variant="body">
                {t('shareThisCode')}
            </TextComponent>

            <View style={styles.codeRow}>
                <View style={[styles.codeBox, { backgroundColor: theme.bgPrimary, borderColor: theme.borderPrimary }]}>
                    <TextComponent style={styles.codeText} color={theme.accent} bold variant="h2">{displayCode}</TextComponent>
                </View>

                <AnimatedPressable
                    style={[styles.copyButton, { backgroundColor: theme.accent }]}
                    onPress={handleCopy}
                    interactionScale="subtle"
                    haptic="light"
                >
                    <Ionicons name="copy-outline" size={24} color={theme.accentText} />
                </AnimatedPressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    codeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    codeBox: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    codeText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    copyButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
