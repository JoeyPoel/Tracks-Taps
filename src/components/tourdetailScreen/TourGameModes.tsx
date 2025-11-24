import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TourGameModesProps {
    modes: string[];
    challengesCount: number;
    stopsCount: number;
}

export default function TourGameModes({ modes, challengesCount, stopsCount }: TourGameModesProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
            <View style={styles.headerRow}>
                <Ionicons name="game-controller-outline" size={20} color={theme.primary} />
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('gameModes')}</Text>
            </View>

            <View style={styles.tagsRow}>
                {modes.map((mode, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.tagText, { color: theme.textOnPrimary }]}>{mode}</Text>
                    </View>
                ))}
            </View>

            <View style={[styles.headerRow, { marginTop: 16 }]}>
                <Ionicons name="radio-button-on-outline" size={20} color={theme.primary} />
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('challengesIncluded')}</Text>
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
                {challengesCount} {t('uniqueChallengesAcross')} {stopsCount} {t('stops')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        marginLeft: 28,
    },
});
