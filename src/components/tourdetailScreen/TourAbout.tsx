import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import React from 'react';
import { StyleSheet, View } from 'react-native';
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
            <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">{t('aboutThisTour')}</TextComponent>
            <TextComponent style={styles.description} color={theme.textSecondary} variant="body">
                {description}
            </TextComponent>
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
