import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface FriendCardProps {
    friend: any;
}

import { GenericCard } from '@/src/components/common/GenericCard';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import

export function FriendCard({ friend }: FriendCardProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <GenericCard
            style={styles.container}
            onPress={() => router.push({ pathname: '/profile/friend-profile', params: { userId: friend.id } })}
            variant="flat"
            padding="small"
        >
            <View style={styles.innerContainer}>
                <Image
                    source={friend.avatarUrl ? { uri: getOptimizedImageUrl(friend.avatarUrl, 100) } : require('../../../assets/images/profilePictureFallback.png')}
                    style={[styles.avatar, { backgroundColor: theme.bgSecondary }]}
                    contentFit="cover"
                    cachePolicy="disk"
                />

                <View style={styles.content}>
                    <TextComponent style={styles.name} color={theme.textPrimary} bold variant="body">
                        {friend.name}
                    </TextComponent>

                    <View style={styles.statsRow}>
                        <View style={[styles.badge, { backgroundColor: theme.bgSecondary }]}>
                            <TextComponent style={styles.badgeText} color={theme.primary} bold variant="caption">
                                Lvl {friend.level}
                            </TextComponent>
                        </View>
                        <TextComponent style={styles.xpText} color={theme.textTertiary} variant="caption">
                            •
                        </TextComponent>
                        <TextComponent style={styles.xpText} color={theme.textSecondary} variant="caption">
                            {friend.xp || 0} {t('xp')}
                        </TextComponent>
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
            </View>
        </GenericCard>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        marginRight: 16,
    },
    content: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    xpText: {
        fontSize: 12,
    },
});
