import { useTheme } from '@/src/context/ThemeContext';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LockClosedIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { AchievementIcon } from './AchievementIcon';

interface Achievement {
    id: number | string;
    title: string;
    description: string;
    icon: string;
    color: string;
    unlocked?: boolean;
    unlockedAt?: string;
}

interface AchievementGridItemProps {
    achievement: Achievement;
    index: number;
}

export const AchievementGridItem = ({ achievement, index }: AchievementGridItemProps) => {
    const { theme } = useTheme();
    const isUnlocked = achievement.unlocked;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(500)}
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
                    <AchievementIcon icon={achievement.icon} size={32} color={achievement.color} solid />
                ) : (
                    <LockClosedIcon size={24} color={theme.textTertiary} />
                )}
            </View>

            <Text style={[styles.cardTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {isUnlocked ? achievement.title : '???'}
            </Text>

            {isUnlocked && (
                <>
                    <Text style={[styles.cardDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                        {achievement.description}
                    </Text>
                    {achievement.unlockedAt && (
                        <Text style={[styles.cardDate, { color: theme.textTertiary }]}>
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </Text>
                    )}
                </>
            )}
        </Animated.View>
    );
};

export const AchievementGridSkeleton = () => {
    const { theme } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.7, { duration: 800 }), -1, true);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

    return (
        <Animated.View style={[styles.card, { backgroundColor: theme.bgSecondary }, animatedStyle]}>
            <View style={[styles.iconContainer, { backgroundColor: theme.bgPrimary }]} />
            <View style={{ width: '60%', height: 16, backgroundColor: theme.bgPrimary, borderRadius: 4, marginTop: 10 }} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
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
    cardDescription: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 8,
        marginTop: 4,
    },
    cardDate: {
        fontSize: 11,
        textAlign: 'center',
    },
});
