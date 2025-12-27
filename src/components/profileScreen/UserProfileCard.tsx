import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { PencilIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface UserProfileCardProps {
    name: string;
    level: number;
    currentXP: number;
    maxXP: number;
    avatarUrl?: string;
    onEditPress?: () => void;
}

export default function UserProfileCard({
    name,
    level,
    currentXP,
    maxXP,
    avatarUrl,
    onEditPress,
}: UserProfileCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const progressPercent = Math.min((currentXP / maxXP) * 100, 100);

    return (
        <View style={styles.container}>
            {/* Avatar Section */}
            <View style={styles.avatarWrapper}>
                <Image
                    source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/images/Mascott.png')}
                    style={[styles.avatar, { borderColor: theme.bgSecondary }]}
                />

                {onEditPress && (
                    <AnimatedPressable
                        onPress={onEditPress}
                        style={[styles.editButton, { backgroundColor: theme.primary, borderColor: theme.bgPrimary }]}
                    >
                        <PencilIcon size={14} color="#FFF" />
                    </AnimatedPressable>
                )}
            </View>

            {/* User Info */}
            <View style={styles.infoCenter}>
                <Text style={[styles.name, { color: theme.textPrimary }]}>{name}</Text>

                <View style={[styles.badgeContainer, { backgroundColor: theme.bgSecondary }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>Reviewer Level {level}</Text>
                </View>
            </View>

            {/* XP Bar */}
            <View style={styles.xpContainer}>
                <View style={styles.xpTextRow}>
                    <Text style={[styles.xpText, { color: theme.textSecondary }]}>{currentXP} / {maxXP} XP</Text>
                </View>
                <View style={[styles.track, { backgroundColor: theme.bgSecondary }]}>
                    <LinearGradient
                        colors={[theme.fixedGradientFromLevel, theme.fixedGradientToLevel]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.fill, { width: `${progressPercent}%` }]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    avatarWrapper: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
    },
    editButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        padding: 6,
        borderRadius: 20,
        borderWidth: 3,
    },
    infoCenter: {
        alignItems: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    badgeContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    xpContainer: {
        width: '60%',
        alignItems: 'center',
    },
    xpTextRow: {
        marginBottom: 6,
    },
    xpText: {
        fontSize: 12,
        fontWeight: '600',
    },
    track: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    }
});
