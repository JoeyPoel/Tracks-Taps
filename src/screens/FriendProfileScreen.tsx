import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import UserProfileCard from '@/src/components/profileScreen/UserProfileCard';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { userService } from '@/src/services/userService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';


export default function FriendProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const { userId } = useLocalSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

    const loadUser = async () => {
        try {
            // We need a way to get another user's profile.
            // userService.getUserProfile takes a userId.
            const data = await userService.getUserProfile(Number(userId));
            setUser(data);
        } catch (error) {
            console.error('Error loading friend profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
            </ScreenWrapper>
        );
    }

    if (!user) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.textPrimary }}>{t('userNotFound')}</Text>
            </ScreenWrapper>
        );
    }

    const recentActivity = [
        { id: 1, title: 'Completed "London Pub Golf"', date: '2 days ago', icon: 'trophy' },
        { id: 2, title: 'Reached Level 5', date: '1 week ago', icon: 'star' },
        { id: 3, title: 'Joined "History Walk"', date: '2 weeks ago', icon: 'walk' },
    ];

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header Image Background */}
            <View style={{ height: 220, width: '100%', position: 'relative' }}>
                <ImageBackground
                    source={require('../../assets/images/Mascott.png')} // Or user cover
                    style={{ flex: 1 }}
                    blurRadius={4}
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.3)', theme.bgPrimary]}
                        style={StyleSheet.absoluteFillObject}
                    />
                </ImageBackground>
                <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}>
                    <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </AnimatedPressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} style={{ marginTop: -80 }}>
                {/* Profile Card lifted up */}
                <View style={[styles.cardWrapper, { backgroundColor: theme.bgSecondary }]}>
                    <UserProfileCard
                        name={user.name || t('unknown')}
                        level={user.level}
                        currentXP={user.currentLevelXp}
                        maxXP={user.nextLevelXpStart}
                        avatarUrl={user.avatarUrl}
                    />

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user?.playedTours?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('tours')}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user?.createdTours?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('created')}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user?.friends?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('friends')}</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity Section */}
                <View style={[styles.activitySection, { backgroundColor: theme.bgSecondary }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('recentAchievements') || 'Recent Activity'}</Text>

                    {recentActivity.map((item, index) => (
                        <View key={item.id} style={[styles.activityItem, index < recentActivity.length - 1 && styles.borderBottom, { borderColor: theme.borderPrimary }]}>
                            <View style={[styles.activityIcon, { backgroundColor: theme.bgPrimary }]}>
                                <Ionicons name={item.icon as any} size={18} color={theme.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.activityTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                                <Text style={[styles.activityDate, { color: theme.textSecondary }]}>{item.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardWrapper: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statVal: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    activitySection: {
        borderRadius: 24,
        padding: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    activityDate: {
        fontSize: 12,
        opacity: 0.7,
    },
});
