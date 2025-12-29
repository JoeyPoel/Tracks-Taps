import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import UserProfileCard from '@/src/components/profileScreen/UserProfileCard';
import ProfileSkeleton from '@/src/components/skeletons/ProfileSkeleton';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { userService } from '@/src/services/userService';
import { LevelSystem } from '@/src/utils/levelUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FriendProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const { userId } = useLocalSearchParams();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

    const loadUser = async () => {
        try {
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
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
                <ProfileSkeleton />
            </ScreenWrapper>
        );
    }

    if (!user) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.textSecondary }}>{t('userNotFound')}</Text>
            </ScreenWrapper>
        );
    }

    const recentActivity = [
        { id: 1, title: 'Completed "London Pub Golf"', date: '2d ago', icon: 'trophy-outline' },
        { id: 2, title: 'Reached Level 5', date: '1w ago', icon: 'star-outline' },
        { id: 3, title: 'Joined "History Walk"', date: '2w ago', icon: 'walk-outline' },
    ];

    const progress = user ? LevelSystem.getProgress(user.xp || 0) : { level: 1, currentLevelXp: 0, nextLevelXpStart: 500 };

    return (
        <ScreenWrapper style={{ flex: 1, backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View style={styles.headerContainer}>
                <ImageBackground
                    source={require('../../assets/images/Mascott.png')} // Fallback or user cover
                    style={styles.headerImage}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', theme.bgPrimary]}
                        style={styles.headerGradient}
                        locations={[0, 1]}
                    />
                </ImageBackground>

                <View style={[styles.backButtonContainer, { top: insets.top + 10 }]}>
                    <AnimatedPressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </AnimatedPressable>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
            >
                {/* Profile Section - Clean floating look */}
                <View style={styles.profileSection}>
                    <UserProfileCard
                        name={user.name || t('unknown')}
                        level={progress.level}
                        currentXP={progress.currentLevelXp}
                        maxXP={progress.nextLevelXpStart}
                        avatarUrl={user.avatarUrl}
                    />

                    {/* Minimalist Stats Row - No dividers, just space */}
                    <View style={[styles.statsRow, { backgroundColor: theme.bgSecondary }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user?.playedTours?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('tours')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user?.createdTours?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('created')}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statVal, { color: theme.textPrimary }]}>{user?.friends?.length || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('friends')}</Text>
                        </View>
                    </View>
                </View>

                {/* Activity Feed - Clean list, no heavy cards */}
                <View style={styles.activitySection}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('recentAchievements') || 'Activity'}</Text>

                    <View style={styles.activityList}>
                        {recentActivity.map((item) => (
                            <View key={item.id} style={styles.activityItem}>
                                <View style={[styles.activityIconCircle, { backgroundColor: theme.bgSecondary }]}>
                                    <Ionicons name={item.icon as any} size={20} color={theme.accent} />
                                </View>
                                <View style={styles.activityInfo}>
                                    <Text style={[styles.activityTitle, { color: theme.textPrimary }]}>{item.title}</Text>
                                    <Text style={[styles.activityDate, { color: theme.textTertiary }]}>{item.date}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        height: 300,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    headerGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    backButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10, // Extra spacing if SafeAreaView isn't enough contextually
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 220, // Push content down to reveal key parts of image
        paddingBottom: 40,
    },
    profileSection: {
        gap: 20,
        marginBottom: 32,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 20,
        borderRadius: 24,
        // Optional: ultra subtle shadow or none for cleanliness
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statVal: {
        fontSize: 22,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activitySection: {
        gap: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 4,
    },
    activityList: {
        gap: 12,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 8,
    },
    activityIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityInfo: {
        flex: 1,
        gap: 2,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    activityDate: {
        fontSize: 13,
    },
});
