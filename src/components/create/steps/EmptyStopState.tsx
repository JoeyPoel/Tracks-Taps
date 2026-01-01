import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextComponent } from '../../common/TextComponent'; // Added import

export function EmptyStopState() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.emptyState, { backgroundColor: theme.bgSecondary }]}>
            <Ionicons name="map-outline" size={48} color={theme.primary} />
            <TextComponent style={styles.emptyText} color={theme.textPrimary} bold variant="h3">
                {t('emptyStopText')}
            </TextComponent>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: {
        padding: 40,
        alignItems: 'center',
        borderRadius: 24,
        gap: 12,
        marginBottom: 20,
    },
    emptyText: {
        // fontSize and fontWeight handled by TextComponent
    },
});
