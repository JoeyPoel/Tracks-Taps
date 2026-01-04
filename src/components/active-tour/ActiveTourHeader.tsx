import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BoltIcon, FireIcon, StarIcon, XMarkIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { TextComponent } from '../common/TextComponent';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ActiveTourHeaderProps {
    level: number;
    currentXP: number;
    maxXP: number;
    currentStop: number;
    totalStops: number;
    streak: number;
    tokens: number;
    onClose: () => void;
}

export default function ActiveTourHeader({
    level,
    currentXP,
    maxXP,
    currentStop,
    totalStops,
    streak,
    tokens,
    onClose,
}: ActiveTourHeaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const xpProgress = Math.min(Math.max(currentXP / maxXP, 0), 1) * 100;
    const stopProgress = Math.min(Math.max(currentStop / totalStops, 0), 1) * 100;

    const xpAnim = useRef(new Animated.Value(0)).current;
    const stopAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(xpAnim, {
                toValue: xpProgress,
                duration: 1000,
                useNativeDriver: false,
            }),
            Animated.timing(stopAnim, {
                toValue: stopProgress,
                duration: 1000,
                useNativeDriver: false,
            }),
        ]).start();
    }, [xpProgress, stopProgress]);

    const xpWidth = xpAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    const stopWidth = stopAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.bgPrimary, borderBottomColor: theme.borderPrimary }]}>
            {/* Row 1: Close + Stats */}
            <View style={styles.topRow}>
                <AnimatedPressable onPress={onClose} style={styles.closeButton} interactionScale="subtle">
                    <XMarkIcon size={24} color={theme.textPrimary} />
                </AnimatedPressable>

                <View style={styles.statsContainer}>
                    <View style={[styles.statBadge, { backgroundColor: theme.bgTertiary }]}>
                        <FireIcon size={16} color={theme.orange} />
                        <TextComponent style={styles.statText} color={theme.textPrimary} bold variant="label">{streak}</TextComponent>
                    </View>
                    <View style={[styles.statBadge, { backgroundColor: theme.bgTertiary }]}>
                        <BoltIcon size={16} color={theme.primary} />
                        <TextComponent style={styles.statText} color={theme.textPrimary} bold variant="label">{tokens}</TextComponent>
                    </View>
                </View>
            </View>

            {/* Row 2: Level + XP Text */}
            <View style={styles.levelRow}>
                <View style={styles.levelBadge}>
                    <StarIcon size={14} color={theme.starColor} />
                    <TextComponent style={styles.levelText} color={theme.starColor} bold variant="label">{t('level')} {level}</TextComponent>
                </View>
                <TextComponent style={styles.xpText} color={theme.textSecondary} variant="caption">{currentXP} / {maxXP} {t('xp')}</TextComponent>
            </View>

            {/* Row 3: XP Bar */}
            <View style={styles.xpBarContainer}>
                <View style={[styles.progressBarBg, { backgroundColor: theme.bgTertiary }]}>
                    <AnimatedLinearGradient
                        colors={[theme.fixedGradientFromLevel, theme.fixedGradientToLevel]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBarFill, { width: xpWidth }]}
                    />
                </View>
            </View>


            {/* Row 4: Stop Info + Stop Bar */}
            <View style={styles.stopRow}>
                <TextComponent style={styles.stopText} color={theme.textSecondary} variant="body">
                    {t('Stop')} {currentStop} / {totalStops}
                </TextComponent>
                <View style={styles.stopBarContainer}>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.bgTertiary }]}>
                        <AnimatedLinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressBarFill, { width: stopWidth }]}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10, // Safe area
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButton: {
        padding: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    statText: {
        // handled by TextComponent
    },
    levelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    levelText: {
        // handled by TextComponent
    },
    xpText: {
        // handled by TextComponent
    },
    xpBarContainer: {
        marginBottom: 12,
    },
    stopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stopText: {
        minWidth: 70,
    },
    stopBarContainer: {
        flex: 1,
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
});
