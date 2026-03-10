import { TextComponent } from '@/src/components/common/TextComponent';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface TourCodeDisplayProps {
    code: string;
}

export const TourCodeDisplay = ({ code }: TourCodeDisplayProps) => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const displayCode = `${code}`;

    const handleCopy = async () => {
        await Clipboard.setStringAsync(code.toString());
        await Clipboard.setStringAsync(displayCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    return (
        <Animated.View layout={LinearTransition} style={[styles.container, { backgroundColor: theme.bgSecondary, borderColor: theme.accent }]}>
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
                    style={[styles.copyButton, { backgroundColor: copied ? theme.success : theme.accent }]}
                    onPress={handleCopy}
                    interactionScale="subtle"
                    haptic="light"
                    disabled={copied}
                >
                    <Ionicons name={copied ? "checkmark-outline" : "copy-outline"} size={24} color={theme.accentText} />
                </AnimatedPressable>
            </View>

            {copied && (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.copiedContainer}>
                    <TextComponent style={styles.copiedText} color={theme.success} bold variant="caption">
                        Copied!
                    </TextComponent>
                </Animated.View>
            )}
        </Animated.View>
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
    copiedContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    copiedText: {
        fontSize: 14,
    }
});
