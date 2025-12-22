import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function PostTourHeader() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <LinearGradient
            colors={[theme.secondary, theme.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
        >
            <Text style={[styles.headerTitle, { color: theme.fixedWhite }]}>{t('greatJobTitle')}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.fixedWhite }]}>{t('waitingForTeams')}</Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    headerGradient: {
        width: '100%',
        paddingTop: 20,
        paddingBottom: 15,
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.8,
    },
});
