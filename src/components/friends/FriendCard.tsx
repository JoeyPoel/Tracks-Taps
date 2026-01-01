import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface FriendCardProps {
    friend: any;
}

import { GenericCard } from '@/src/components/common/GenericCard';

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
                    source={friend.avatarUrl ? { uri: friend.avatarUrl } : require('../../../assets/images/Mascott.png')}
                    style={[styles.avatar, { backgroundColor: theme.bgSecondary }]}
                />

                <View style={styles.content}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{friend.name}</Text>

                    <View style={styles.statsRow}>
                        <View style={[styles.badge, { backgroundColor: theme.bgSecondary }]}>
                            <Text style={[styles.badgeText, { color: theme.primary }]}>Lvl {friend.level}</Text>
                        </View>
                        <Text style={[styles.xpText, { color: theme.textTertiary }]}>•</Text>
                        <Text style={[styles.xpText, { color: theme.textSecondary }]}>{friend.xp || 0} {t('xp')}</Text>
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
