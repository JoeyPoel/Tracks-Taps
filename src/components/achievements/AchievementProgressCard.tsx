import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrophyIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

interface AchievementProgressCardProps {
    unlockedCount: number;
    totalCount: number;
    loading?: boolean;
}

export const AchievementProgressCard = ({ unlockedCount, totalCount, loading }: AchievementProgressCardProps) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    if (loading) {
        return <ProgressSkeleton />;
    }

    return (
        <Animated.View entering={FadeInDown.duration(500)}>
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
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: '#FFF' }]} />
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const ProgressSkeleton = () => {
    const { theme } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View style={[styles.progressCard, { backgroundColor: theme.bgSecondary, height: 140 }, animatedStyle]}>
            <View style={{ width: '40%', height: 20, backgroundColor: theme.bgPrimary, borderRadius: 4, marginBottom: 10 }} />
            <View style={{ width: '60%', height: 32, backgroundColor: theme.bgPrimary, borderRadius: 4 }} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
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
});
