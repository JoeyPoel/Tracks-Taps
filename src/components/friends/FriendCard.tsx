import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface FriendCardProps {
    friend: any;
}

export function FriendCard({ friend }: FriendCardProps) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <AnimatedPressable
            style={[styles.card, { backgroundColor: theme.bgSecondary }]}
            onPress={() => router.push({ pathname: '/friend-profile', params: { userId: friend.id } })}
            interactionScale="subtle"
            haptic="selection"
        >
            <View style={styles.cardContent}>
                <Image
                    source={friend.avatarUrl ? { uri: friend.avatarUrl } : require('../../../assets/images/Mascott.png')}
                    style={[styles.avatar, { borderColor: theme.bgPrimary }]}
                />

                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{friend.name}</Text>

                    <View style={styles.badgeRow}>
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.levelBadge}
                        >
                            <Ionicons name="trophy" size={10} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.levelText}>Lvl {friend.level}</Text>
                        </LinearGradient>

                        <View style={[styles.pointsBadge, { backgroundColor: theme.bgPrimary }]}>
                            <Text style={[styles.pointsText, { color: theme.textSecondary }]}>{friend.xp || 0} XP</Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.arrowContainer, { backgroundColor: theme.bgPrimary }]}>
                    <Ionicons name="chevron-forward" size={18} color={theme.primary} />
                </View>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 12,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 18,
        marginRight: 14,
        borderWidth: 2,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    levelText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    pointsBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    pointsText: {
        fontSize: 11,
        fontWeight: '600',
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
