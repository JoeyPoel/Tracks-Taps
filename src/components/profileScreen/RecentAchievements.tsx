import { useLanguage } from '@/src/context/LanguageContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    BoltIcon,
    FireIcon,
    FlagIcon,
    GlobeAmericasIcon,
    MapPinIcon,
    StarIcon,
    TrophyIcon,
    UserGroupIcon
} from 'react-native-heroicons/outline';
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
}

export default function RecentAchievements({ achievements }: RecentAchievementsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'trophy': return TrophyIcon;
            case 'map': return MapPinIcon;
            case 'flame': return FireIcon;
            case 'flash': return BoltIcon;
            case 'star': return StarIcon;
            case 'flag': return FlagIcon;
            case 'globe': return GlobeAmericasIcon;
            case 'people': return UserGroupIcon;
            default: return StarIcon;
        }
    };

    if (!achievements || achievements.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.header, { color: theme.textSecondary }]}>{t('recentAchievements')?.toUpperCase()}</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
            >
                {achievements.map((achievement) => {
                    const IconComponent = getIconComponent(achievement.icon);
                    return (
                        <View key={achievement.id} style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                            <View style={[styles.iconContainer, { backgroundColor: achievement.color + '15' }]}>
                                <IconComponent size={28} color={achievement.color} />
                            </View>
                            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{achievement.title}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    headerRow: {
        marginBottom: 12,
        paddingLeft: 4,
    },
    header: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
