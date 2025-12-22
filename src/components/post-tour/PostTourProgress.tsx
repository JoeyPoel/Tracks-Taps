import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PostTourProgressProps {
    finishedCount: number;
    totalTeamCount: number;
    progressPercentage: number;
}

export default function PostTourProgress({ finishedCount, totalTeamCount, progressPercentage }: PostTourProgressProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.progressContainer}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>{t('tourProgress')}</Text>
            <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                {t('teamsCompleted').replace('{0}', finishedCount.toString()).replace('{1}', totalTeamCount.toString())}
            </Text>

            <View style={[styles.progressBarBackground, { backgroundColor: theme.bgSecondary }]}>
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
    progressContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    progressSubtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    progressBarBackground: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});
