import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PostTourProgressProps {
    finishedCount: number;
    totalTeamCount: number;
    progressPercentage: number;
}

export default function PostTourProgress({ finishedCount, totalTeamCount, progressPercentage }: PostTourProgressProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
            <View style={styles.headerRow}>
                <TextComponent style={styles.progressTitle} color={theme.textPrimary} bold variant="h3">
                    {t('tourProgress')}
                </TextComponent>
                <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                    <TextComponent style={styles.badgeText} color={theme.primary} bold variant="caption">
                        {Math.round(progressPercentage)}%
                    </TextComponent>
                </View>
            </View>

            <TextComponent style={styles.progressSubtitle} color={theme.textSecondary} variant="body">
                {finishedCount} {t('of')} {totalTeamCount} {t('teamsFinishedCount')}
            </TextComponent>

            <View style={[styles.progressBarBackground, { backgroundColor: theme.bgPrimary }]}>
                <LinearGradient
                    colors={[theme.secondary, theme.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    progressSubtitle: {
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.8,
    },
    progressBarBackground: {
        width: '100%',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
});
