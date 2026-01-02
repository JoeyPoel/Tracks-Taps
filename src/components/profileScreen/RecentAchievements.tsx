import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { useLanguage } from '@/src/context/LanguageContext';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
                <TextComponent style={styles.header} color={theme.textSecondary} bold variant="caption">{t('recentAchievements')?.toUpperCase()}</TextComponent>
                {onSeeAll && (
                    <TextComponent onPress={onSeeAll} style={styles.seeAll} color={theme.primary} bold variant="body">
                        {t('seeAll')}
                    </TextComponent>
                )}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
            >
                {loading ? (
                    <>
                        <AchievementSkeleton />
                        <AchievementSkeleton />
                        <AchievementSkeleton />
                    </>
                ) : achievements && achievements.length > 0 ? (
                    achievements.map((achievement, index) => {
                        const activeColor = achievement.color || theme.primary;
                        return (
                            <Animated.View
                                entering={FadeIn.delay(index * 100)}
                                key={achievement.id}
                            >
                                <View
                                    style={[
                                        styles.card,
                                        { backgroundColor: theme.bgSecondary }
                                    ]}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: activeColor + '15' }]}>
                                        <AchievementIcon icon={achievement.icon} size={28} color={activeColor} solid={false} />
                                    </View>
                                    <TextComponent style={styles.title} color={theme.textPrimary} variant="caption" numberOfLines={1}>
                                        {achievement.title}
                                    </TextComponent>
                                </View>
                            </Animated.View>
                        );
                    })
                ) : (
                    <TextComponent style={styles.emptyText} color={theme.textSecondary} variant="body">{t('noAchievementsYet') || 'No achievements yet'}</TextComponent>
                )}
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    headerRow: {
        marginBottom: 16,
        paddingHorizontal: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        padding: 16,
        borderRadius: 20,
        width: 120,
        height: 140, // Slightly taller for better spacing
        justifyContent: 'center',
        // Premium Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        marginVertical: 4, // Allow shadow space
        marginHorizontal: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12, // Rounded square to match new List Item style
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        // Clean solid look
    },
    title: {
        fontSize: 11,
        fontWeight: '600',
        textAlign: 'center',
        width: '100%',
        opacity: 0.9,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
        marginLeft: 4,
        padding: 12,
    },
});


