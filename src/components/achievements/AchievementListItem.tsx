import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LockClosedIcon } from 'react-native-heroicons/solid';
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
    progress?: number;
    target?: number;
    unit?: string;
}

interface AchievementListItemProps {
    achievement: Achievement;
}

export const AchievementListItem = ({ achievement }: AchievementListItemProps) => {
    const { theme } = useTheme();
    const isUnlocked = achievement.unlocked;

    // Default values if missing
    const progress = achievement.progress || (isUnlocked ? 1 : 0);
    const target = achievement.target || 1;
    const progressPercent = Math.min((progress / target) * 100, 100);

    // Flitsmeister Style:
    // Left: Big rounded square Icon background.
    // Right: Content
    // Icon Logic:
    // - Unlocked: Colored Background (e.g. Green), Icon inside.
    // - Locked: Gray Background, Lock/Icon inside? Screenshot showed Lock. 
    //   But usually better to show what you get (Icon) but grayed out, or a Lock. 
    //   Screenshot showed a "Lock" on a gray rounded square.

    const iconBgColor = isUnlocked ? (achievement.color || theme.primary) : theme.bgDisabled;

    return (
        <View style={[styles.container, { backgroundColor: theme.bgSecondary }]}>
            {/* Left Icon Area */}
            <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                {isUnlocked ? (
                    <AchievementIcon icon={achievement.icon} size={32} color="#FFF" solid />
                ) : (
                    <LockClosedIcon size={32} color="#FFF" />
                )}
            </View>

            {/* Right Content Area */}
            <View style={styles.contentContainer}>
                <TextComponent
                    style={styles.title}
                    color={theme.textPrimary}
                    bold
                    variant="body"
                >
                    {achievement.title}
                </TextComponent>

                <TextComponent
                    style={styles.description}
                    color={theme.textSecondary}
                    variant="caption"
                >
                    {achievement.description}
                </TextComponent>

                {/* Progress Bar & Text */}
                <View style={styles.progressSection}>
                    <View style={[styles.progressBarBg, { backgroundColor: theme.bgDisabled }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${progressPercent}%`,
                                    backgroundColor: isUnlocked ? (achievement.color || '#8CC63F') : theme.bgDisabled
                                }
                            ]}
                        />
                    </View>
                    <TextComponent
                        style={styles.progressText}
                        color={isUnlocked ? (achievement.color || '#8CC63F') : theme.textPrimary}
                        bold
                        variant="label"
                    >
                        {progress} / {target}
                    </TextComponent>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        // Defined Card Styling
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, // Subtle shadow for definition
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 4, // Spacing handled by List separator usually, but subtle margin helps shadow
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        marginBottom: 2,
        fontSize: 16,
    },
    description: {
        marginBottom: 10,
        lineHeight: 18,
        opacity: 0.8,
    },
    progressSection: {
        marginTop: 2,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        width: '100%',
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
    }
});
