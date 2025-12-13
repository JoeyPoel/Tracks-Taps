import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TourAboutProps {
    description: string;
}

export default function TourAbout({ description }: TourAboutProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t('aboutThisTour')}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
                {description}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        marginTop: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
    },
});
