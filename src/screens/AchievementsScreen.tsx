import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import AppHeader from '@/src/components/Header';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useUserContext } from '@/src/context/UserContext';
import { useAchievements } from '@/src/hooks/useAchievements';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    BoltIcon,
    FireIcon,
    FlagIcon,
    GlobeAmericasIcon,
    LockClosedIcon,
    MapPinIcon,
    StarIcon,
    TrophyIcon,
    UserGroupIcon
} from 'react-native-heroicons/solid';

export default function AchievementsScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const { user } = useUserContext();
    const { loadAllAchievements } = useAchievements();

    const [allAchievements, setAllAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await loadAllAchievements();
        setAllAchievements(data);
        setLoading(false);
    };

    const unlockedCount = allAchievements.filter(a => a.unlocked).length;
    const totalCount = allAchievements.length;
    const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

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

    if (loading) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppHeader showBackButton title={t('achievements')} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Progress Card */}
                <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.progressCard}
                >
                    <View style={styles.progressRow}>
                        <View>
                            <Text style={styles.progressLabel}>{t('totalProgress')}</Text>
                            <Text style={styles.progressValue}>{unlockedCount}/{totalCount} {t('unlocked')}</Text>
                        </View>
                        <TrophyIcon size={48} color="#FFF" style={{ opacity: 0.8 }} />
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.warning }]} />
                    </View>
                </LinearGradient>

                {/* Grid */}
                <View style={styles.grid}>
                    {allAchievements.map((achievement) => {
                        const IconComponent = getIconComponent(achievement.icon);
                        const isUnlocked = achievement.unlocked;

                        return (
                            <View
                                key={achievement.id}
                                style={[
                                    styles.card,
                                    { backgroundColor: theme.bgSecondary },
                                    !isUnlocked && { opacity: 0.6 }
                                ]}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: isUnlocked ? achievement.color + '20' : theme.bgPrimary }
                                ]}>
                                    {isUnlocked ? (
                                        <IconComponent size={32} color={achievement.color} />
                                    ) : (
                                        <LockClosedIcon size={24} color={theme.textTertiary} />
                                    )}
                                </View>

                                <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                                    {isUnlocked ? achievement.title : '???'}
                                </Text>

                                {isUnlocked && (
                                    <Text style={[styles.cardDate, { color: theme.textTertiary }]}>
                                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 20,
    },
    progressCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressValue: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '48%', // Approx 2 columns
        aspectRatio: 1, // Square cards
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    cardDate: {
        fontSize: 11,
        textAlign: 'center',
    },
});
