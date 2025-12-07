import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TeamPreviewProps {
    name: string;
    color: string;
    emoji: string;
}

export const TeamPreview: React.FC<TeamPreviewProps> = ({ name, color, emoji }) => {
    const { theme } = useTheme();
    const { t } = useLanguage(); // Ensure you use 't' if needed, or remove if unused. kept for consistency.

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            <Text style={[styles.title, { color: theme.textSecondary }]}>{t('preview')}</Text>
            <View style={styles.card}>
                <View style={styles.icon}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: 0.5, borderRadius: 24 }]} />
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </View>
                <Text style={[styles.name, { color: theme.textPrimary }]}>
                    {name || t('yourTeamName')}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    title: {
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    icon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
});
