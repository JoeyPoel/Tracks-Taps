import { AchievementGridItem, AchievementGridSkeleton } from '@/src/components/achievements/AchievementGridItem';
import { AchievementProgressCard } from '@/src/components/achievements/AchievementProgressCard';
import { ScreenHeader } from '@/src/components/common/ScreenHeader';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useAchievements } from '@/src/hooks/useAchievements';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function AchievementsScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
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

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader showBackButton title={t('achievements')} />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Progress Card */}
                <AchievementProgressCard
                    loading={loading}
                    unlockedCount={unlockedCount}
                    totalCount={totalCount}
                />

                {/* Grid */}
                <View style={styles.grid}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, i) => <AchievementGridSkeleton key={i} />)
                    ) : (
                        allAchievements.map((achievement, index) => (
                            <AchievementGridItem
                                key={achievement.id}
                                achievement={achievement}
                                index={index}
                            />
                        ))
                    )}
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
});
