import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FriendCardProps {
    friend: any;
}

export function FriendCard({ friend }: FriendCardProps) {
    const { theme } = useTheme();
    const router = useRouter();

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.bgSecondary }]}
            onPress={() => router.push({ pathname: '/friend-profile', params: { userId: friend.id } })}
            activeOpacity={1}
        >
            <View style={styles.cardContent}>
                <Image source={friend.avatarUrl ? { uri: friend.avatarUrl } : require('../../../assets/images/Mascott.png')} style={styles.avatar} />
                <View style={styles.infoContainer}>
                    <Text style={[styles.name, { color: theme.textPrimary }]}>{friend.name}</Text>
                    <View style={styles.levelBadge}>
                        <LinearGradient
                            colors={[theme.primary, theme.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.levelGradient}
                        >
                            <Text style={styles.levelText}>Lvl {friend.level}</Text>
                        </LinearGradient>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 20,
        marginRight: 16,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    levelBadge: {
        flexDirection: 'row',
    },
    levelGradient: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    levelText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
});
