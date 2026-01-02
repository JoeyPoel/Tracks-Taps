import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrophyIcon } from 'react-native-heroicons/solid';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { TextComponent } from '../common/TextComponent';

interface AchievementProgressCardProps {
    unlockedCount: number;
    totalCount: number;
    loading?: boolean;
}

export const AchievementProgressCard = ({ unlockedCount, totalCount, loading }: AchievementProgressCardProps) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

    // Pulse animation for the trophy
    const scale = useSharedValue(1);
    useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    if (loading) {
        return <ProgressSkeleton />;
    }

    return (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
            <LinearGradient
                colors={[theme.primary, theme.secondary]} // Keep primary to secondary for brand consistency, but maybe adjust opacity/start/end
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.8 }}
                style={styles.progressCard}
            >
                <View style={styles.contentRow}>
                    <View style={styles.textColumn}>
                        <TextComponent style={styles.progressLabel} color={theme.fixedWhite} bold variant="label">
                            {t('totalProgress')}
                        </TextComponent>

                        <View style={styles.statsContainer}>
                            <TextComponent style={styles.progressValue} color={theme.fixedWhite} bold variant="h1">
                                {unlockedCount}
                            </TextComponent>
                            <TextComponent style={styles.totalValue} color={theme.fixedWhite} variant="h3">
                                / {totalCount}
                            </TextComponent>
                        </View>

                        <TextComponent style={styles.subtext} color={theme.fixedWhite} variant="caption">
                            {unlockedCount === totalCount ? t('completed') : t('unlocked')}
                        </TextComponent>
                    </View>

                    <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
                        <TrophyIcon size={56} color={theme.fixedWhite} style={styles.trophyIcon} />
                        {/* Glow behind trophy */}
                        <View style={styles.glow} />
                    </Animated.View>
                </View>

                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.fixedWhite }]} />
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
        <Animated.View style={[styles.container, styles.skeletonCard, { backgroundColor: theme.bgSecondary }, animatedStyle]}>
            <View style={{ width: '40%', height: 20, backgroundColor: theme.bgPrimary, borderRadius: 4, marginBottom: 10 }} />
            <View style={{ width: '60%', height: 32, backgroundColor: theme.bgPrimary, borderRadius: 4 }} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        // Shadow for the whole card
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
        borderRadius: 24,
    },
    progressCard: {
        borderRadius: 24,
        padding: 24,
        // Solid gradient card, no borders
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    skeletonCard: {
        height: 140,
        padding: 24,
    },
    contentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    textColumn: {
        flex: 1,
    },
    progressLabel: {
        marginBottom: 4,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    progressValue: {
        fontSize: 32,
        lineHeight: 38,
    },
    totalValue: {
        fontSize: 20,
        marginLeft: 4,
    },
    subtext: {
        marginTop: 2,
    },
    iconWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trophyIcon: {
        zIndex: 2,
        shadowColor: "orange",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    glow: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        zIndex: 1,
        transform: [{ scale: 1.5 }],
    },
    progressBarBg: {
        height: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 5,
    },
});
