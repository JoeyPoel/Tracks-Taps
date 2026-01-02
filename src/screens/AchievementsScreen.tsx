import { AchievementListItem } from '@/src/components/achievements/AchievementListItem';
import { AchievementProgressCard } from '@/src/components/achievements/AchievementProgressCard';
import { ScreenHeader } from '@/src/components/common/ScreenHeader';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useAchievements } from '@/src/hooks/useAchievements';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

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
        // Assuming loadAllAchievements returns everything (locked ones might need to be mocked if backend doesn't return them yet)
        setAllAchievements(data);
        setLoading(false);
    };

    const unlockedCount = allAchievements.filter(a => a.unlocked).length;
    const totalCount = allAchievements.length;

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <ScreenHeader showBackButton title={t('achievements')} />

            <FlatList
                data={loading ? Array.from({ length: 6 }) : allAchievements}
                keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <AchievementProgressCard
                        loading={loading}
                        unlockedCount={unlockedCount}
                        totalCount={totalCount}
                    />
                }
                renderItem={({ item }) => {
                    if (loading || !item) {
                        // Skeleton? Or reuse generic loading state
                        return <View style={{ height: 80, marginBottom: 16, backgroundColor: theme.bgSecondary, borderRadius: 16, opacity: 0.3 }} />;
                    }
                    return (
                        <AchievementListItem achievement={item} />
                    );
                }}
                ItemSeparatorComponent={() => <View style={{ height: 16 }} />} // Spacing between items
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        paddingTop: 20,
    },
});
