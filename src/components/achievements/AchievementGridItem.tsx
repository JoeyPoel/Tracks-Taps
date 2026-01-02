import { useTheme } from '@/src/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LockClosedIcon, StarIcon } from 'react-native-heroicons/solid';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { TextComponent } from '../common/TextComponent';
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

    // Premium Gradient Colors based on "rarity" (simulated by color for now)
    // using achievement.color with some opacity to blend nicely
    const activeColor = achievement.color || theme.primary;

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(500)}
            style={styles.container}
        >
            <LinearGradient
                colors={isUnlocked
                    ? [activeColor + '40', theme.bgSecondary]  // Tinted gradient based on color
                    : [theme.bgDisabled, theme.bgSecondary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.card,
                    { borderColor: isUnlocked ? activeColor + '60' : 'transparent', borderWidth: 1 }
                ]}
            >
                {/* Rarity/Points Badge (Decorative) */}
                {isUnlocked && (
                    <View style={styles.badge}>
                        <StarIcon size={10} color="#FFD700" />
                    </View>
                )}

                <View style={[
                    styles.iconContainer,
                    {
                        backgroundColor: isUnlocked ? theme.bgPrimary : 'rgba(0,0,0,0.1)',
                        borderColor: isUnlocked ? achievement.color : 'transparent',
                    }
                ]}>
                    {isUnlocked ? (
                        <AchievementIcon icon={achievement.icon} size={32} color={achievement.color} solid />
                    ) : (
                        <LockClosedIcon size={24} color={theme.textTertiary} />
                    )}
                </View>

                <View style={styles.textContainer}>
                    <TextComponent
                        style={styles.cardTitle}
                        color={isUnlocked ? theme.textPrimary : theme.textSecondary}
                        bold
                        numberOfLines={2}
                        variant="label" // Smaller but punchy
                    >
                        {isUnlocked ? achievement.title : '???'}
                    </TextComponent>

                    {isUnlocked && (
                        <TextComponent
                            style={styles.cardDescription}
                            color={theme.textSecondary}
                            numberOfLines={2}
                            variant="caption"
                            size={10}
                        >
                            {achievement.description}
                        </TextComponent>
                    )}
                </View>

                {/* Date Footer */}
                {isUnlocked && achievement.unlockedAt && (
                    <View style={styles.footer}>
                        <TextComponent color={theme.textTertiary} size={9} variant="label">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </TextComponent>
                    </View>
                )}
            </LinearGradient>
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
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                <View style={[styles.iconContainer, { backgroundColor: theme.bgPrimary }]} />
                <View style={{ width: '60%', height: 12, backgroundColor: theme.bgPrimary, borderRadius: 4, marginTop: 10 }} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%', // Approx 2 columns
        aspectRatio: 0.85, // Taller card for better layout
    },
    card: {
        flex: 1,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'flex-start',
        // Premium Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
        // Removed border, relying on soft bg
    },
    textContainer: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    cardTitle: {
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    cardDescription: {
        textAlign: 'center',
        opacity: 0.8,
        lineHeight: 14,
    },
    footer: {
        marginTop: 'auto',
        opacity: 0.6,
    }
});
