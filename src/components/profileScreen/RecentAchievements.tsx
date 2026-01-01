import { useLanguage } from '@/src/context/LanguageContext';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface Achievement {
    id: number | string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlockedAt?: string;
}

interface RecentAchievementsProps {
    achievements: Achievement[];
    loading?: boolean;
    onSeeAll?: () => void;
}

const AchievementSkeleton = () => {
    const { theme } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View style={[styles.card, { backgroundColor: theme.bgSecondary }, animatedStyle]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.bgPrimary, opacity: 0.5 }]} />
            <View style={{ width: '80%', height: 12, backgroundColor: theme.bgPrimary, borderRadius: 6, opacity: 0.5 }} />
        </Animated.View>
    );
};

import { AchievementIcon } from '@/src/components/achievements/AchievementIcon';

export default function RecentAchievements({ achievements, loading, onSeeAll }: RecentAchievementsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.header, { color: theme.textSecondary }]}>{t('recentAchievements')?.toUpperCase()}</Text>
                {onSeeAll && (
                    <Text onPress={onSeeAll} style={[styles.seeAll, { color: theme.primary }]}>
                        {t('seeAll')}
                    </Text>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
            >
                {loading ? (
                    <>
                        <AchievementSkeleton />
                        <AchievementSkeleton />
                        <AchievementSkeleton />
                        <AchievementSkeleton />
                    </>
                ) : achievements && achievements.length > 0 ? (
                    achievements.map((achievement, index) => {
                        return (
                            <Animated.View
                                entering={FadeIn.delay(index * 100)}
                                key={achievement.id}
                                style={[styles.card, { backgroundColor: theme.bgSecondary }]}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: achievement.color + '15' }]}>
                                    <AchievementIcon icon={achievement.icon} size={28} color={achievement.color} solid={false} />
                                </View>
                                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{achievement.title}</Text>
                            </Animated.View>
                        );
                    })
                ) : (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t('noAchievementsYet') || 'No achievements yet'}</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    },
    headerRow: {
        marginBottom: 12,
        paddingLeft: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 4,
    },
    header: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    seeAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        width: 100,
        height: 110,
        justifyContent: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        width: '100%',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginLeft: 4,
    },
});
