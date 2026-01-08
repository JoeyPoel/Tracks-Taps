import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PencilIcon } from 'react-native-heroicons/outline';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';
import { TextComponent } from '../common/TextComponent'; // Added import

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
                    source={avatarUrl ? { uri: getOptimizedImageUrl(avatarUrl, 200) } : require('../../../assets/images/Mascott.png')}
                    style={[styles.avatar, { borderColor: theme.bgSecondary }]}
                    contentFit="cover"
                    cachePolicy="disk"
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
                <TextComponent style={styles.name} color={theme.textPrimary} bold variant="h2">{name}</TextComponent>

                <View style={[styles.badgeContainer, { backgroundColor: theme.bgSecondary }]}>
                    <TextComponent style={styles.badgeText} color={theme.primary} bold variant="caption">{t('reviewerLevel')} {level}</TextComponent>
                </View>
            </View>

            {/* XP Bar */}
            <View style={styles.xpContainer}>
                <View style={styles.xpTextRow}>
                    <TextComponent style={styles.xpText} color={theme.textSecondary} variant="caption">{currentXP} / {maxXP} {t('xp')}</TextComponent>
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
        paddingVertical: 32,
    },
    avatarWrapper: {
        marginBottom: 24,
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
        marginBottom: 24,
    },
    name: {
        marginBottom: 8,
    },
    badgeContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    badgeText: {
        // handled by TextComponent
    },
    xpContainer: {
        width: '80%',
        alignItems: 'center',
    },
    xpTextRow: {
        marginBottom: 6,
    },
    xpText: {
        // handled by TextComponent
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
