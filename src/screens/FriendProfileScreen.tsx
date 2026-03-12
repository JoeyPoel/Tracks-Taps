import { AnimatedButton } from '@/src/components/common/AnimatedButton';
import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { TextComponent } from '@/src/components/common/TextComponent';
import { FriendCard } from '@/src/components/friends/FriendCard';
import UserProfileCard from '@/src/components/profileScreen/UserProfileCard';
import ProfileSkeleton from '@/src/components/skeletons/ProfileSkeleton';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { useFriends } from '@/src/hooks/useFriends';
import { useSafeNavigation } from '@/src/hooks/useSafeNavigation';
import { friendService } from '@/src/services/friendsService';
import { userService } from '@/src/services/userService';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { LevelSystem } from '@/src/utils/levelUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TourCard from '../components/exploreScreen/TourCard';
import ProfileStats from '../components/profileScreen/ProfileStats';
import RecentAchievements from '../components/profileScreen/RecentAchievements';
import { achievementService } from '../services/achievementService';
export default function FriendProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { goBack } = useSafeNavigation();
    const { t } = useLanguage();
    const { userId } = useLocalSearchParams();
    const [user, setUser] = useState<any>(null);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [userFriends, setUserFriends] = useState<any[]>([]);
    const [latestPlayed, setLatestPlayed] = useState<any>(null);
    const [latestCreated, setLatestCreated] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();
    const { sendFriendRequest, removeFriend, actionLoading } = useFriends();

    useEffect(() => {
        if (userId && userId !== 'unknown' && !isNaN(Number(userId))) {
            loadUser();
            loadUserFriends();
            loadUserTours();
        } else if (userId === 'unknown' || (userId && isNaN(Number(userId)))) {
            setLoading(false);
            setUser(null);
        }
    }, [userId]);

    const loadUserTours = async () => {
        try {
            const [playedRes, createdRes] = await Promise.all([
                userService.getUserPlayedTours(Number(userId), 1, 1),
                userService.getUserCreatedTours(Number(userId), 1, 1)
            ]);
            if (playedRes?.data?.length > 0) setLatestPlayed(playedRes.data[0]);
            if (createdRes?.data?.length > 0) setLatestCreated(createdRes.data[0]);
        } catch (error) {
            console.error('Error loading latest tours:', error);
        }
    };

    const loadUser = async () => {
        try {
            const [userData, achievementsData] = await Promise.all([
                userService.getUserProfile(Number(userId)),
                achievementService.getUserAchievements(Number(userId))
            ]);
            setUser(userData);
            setAchievements(achievementsData);
        } catch (error) {
            console.error('Error loading friend profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserFriends = async () => {
        try {
            const data = await friendService.getFriends(1, 4, Number(userId)); // limit to 4 to see if >3
            setUserFriends(data.data || []);
        } catch (error) {
            console.error('Error loading user friends:', error);
        }
    };

    const handleAction = async () => {
        if (!user) return;

        if (user.friendshipStatus === 'ACCEPTED') {
            const success = await removeFriend(user.id);
            if (success) loadUser();
        } else if (!user.friendshipStatus) {
            const success = await sendFriendRequest(user.username || user.email);
            if (success) loadUser();
        }
    };

    if (loading) {
        return (
            <ScreenWrapper style={{ flex: 1, backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Immersive Header - just for skeleton structure */}
                <View style={styles.headerContainer}>
                    <ImageBackground
                        source={require('../../assets/images/profilePictureFallback.png')}
                        style={styles.headerImage}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.1)', theme.bgPrimary]}
                            style={styles.headerGradient}
                            locations={[0, 1]}
                        />
                    </ImageBackground>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollView}
                >
                    <ProfileSkeleton />
                </ScrollView>

                <View style={[styles.backButtonContainer, { top: insets.top + 10 }]} pointerEvents="box-none">
                    <AnimatedPressable onPress={goBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </AnimatedPressable>
                </View>
            </ScreenWrapper>
        );
    }

    if (!user) {
        return (
            <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
                <TextComponent color={theme.textSecondary} variant="body">{t('userNotFound')}</TextComponent>
            </ScreenWrapper>
        );
    }

    const progress = user ? LevelSystem.getProgress(user.xp || 0) : { level: 1, currentLevelXp: 0, nextLevelXpStart: 500 };

    return (
        <ScreenWrapper style={{ flex: 1, backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View style={styles.headerContainer}>
                <ImageBackground
                    source={user?.avatarUrl ? { uri: getOptimizedImageUrl(user.avatarUrl, 800) } : require('../../assets/images/profilePictureFallback.png')}
                    style={styles.headerImage}
                    resizeMode="cover"
                >
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', theme.bgPrimary]}
                        style={styles.headerGradient}
                        locations={[0, 1]}
                    />
                </ImageBackground>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={styles.scrollView}
            >
                <View style={styles.profileSection}>
                    <UserProfileCard
                        name={user.name || t('unknown')}
                        level={progress.level}
                        currentXP={progress.currentLevelXp}
                        maxXP={progress.nextLevelXpStart}
                        avatarUrl={user.avatarUrl}
                    />

                    {/* Action Button */}
                    <View style={styles.actionButtonContainer}>
                        {user.friendshipStatus === 'PENDING' ? (
                            <AnimatedButton
                                title={t('requested')}
                                onPress={() => { }}
                                disabled
                                variant="outline"
                            />
                        ) : (
                            <AnimatedButton
                                title={user.friendshipStatus === 'ACCEPTED' ? t('removeFriendTitle') : t('addFriend')}
                                onPress={handleAction}
                                loading={actionLoading}
                                variant={user.friendshipStatus === 'ACCEPTED' ? 'outline' : 'primary'}
                            />
                        )}
                    </View>

                    <ProfileStats
                        toursDone={user?.stats?.toursDone || 0}
                        toursCreated={user?.stats?.toursCreated || 0}
                        friends={user?.stats?.friends || 0}
                        onPressToursDone={() => router.push({ pathname: '/profile/tours-done', params: { type: 'done', title: t('toursDone'), targetUserId: user.id } })}
                        onPressToursCreated={() => router.push({ pathname: '/profile/tours-created', params: { type: 'created', title: t('toursCreated'), targetUserId: user.id } })}
                        onPressFriends={() => router.push({ pathname: '/profile/user-friends', params: { userId: user.id, userName: user.name || user.username } })}
                    />
                </View>

                {/* Tour Activity Section */}
                {(latestPlayed?.tour || latestCreated) && (
                    <View style={styles.section}>
                        <TextComponent variant="h3" bold style={styles.sectionTitle}>{t('recentActivity') || 'Recent Activity'}</TextComponent>

                        {latestCreated && (
                            <View style={{ marginBottom: 16 }}>
                                <TextComponent variant="label" color={theme.textSecondary} style={{ marginBottom: 8, paddingLeft: 4 }}>
                                    {t('latestCreated') || 'Latest Created Tour'}
                                </TextComponent>
                                <TourCard
                                    title={latestCreated.title}
                                    author={latestCreated.author?.name || 'Unknown'}
                                    imageUrl={latestCreated.imageUrl}
                                    distance={`${latestCreated.distance} km`}
                                    duration={`${latestCreated.duration} min`}
                                    stops={latestCreated._count?.stops || 0}
                                    rating={latestCreated.reviews?.reduce((acc: number, r: any) => acc + r.rating, 0) / (latestCreated.reviews?.length || 1) || 0}
                                    reviewCount={latestCreated._count?.reviews || 0}
                                    points={latestCreated.points || 0}
                                    location={latestCreated.location}
                                    modes={latestCreated.modes}
                                    genre={latestCreated.genre}
                                    tourType={latestCreated.type}
                                    variant="grid"
                                    onPress={() => router.push({ pathname: '/tour/[id]', params: { id: latestCreated.id } })}
                                />
                            </View>
                        )}

                        {latestPlayed?.tour && (
                            <View style={{ marginBottom: 16 }}>
                                <TextComponent variant="label" color={theme.textSecondary} style={{ marginBottom: 8, paddingLeft: 4 }}>
                                    {t('latestPlayed') || 'Latest Played Tour'}
                                </TextComponent>
                                <TourCard
                                    title={latestPlayed.tour.title}
                                    author={latestPlayed.tour.author?.name || 'Unknown'}
                                    imageUrl={latestPlayed.tour.imageUrl}
                                    distance={`${latestPlayed.tour.distance} km`}
                                    duration={`${latestPlayed.tour.duration} min`}
                                    stops={latestPlayed.tour._count?.stops || 0}
                                    rating={latestPlayed.tour.reviews?.reduce((acc: number, r: any) => acc + r.rating, 0) / (latestPlayed.tour.reviews?.length || 1) || 0}
                                    reviewCount={latestPlayed.tour._count?.reviews || 0}
                                    points={latestPlayed.tour.points || 0}
                                    location={latestPlayed.tour.location}
                                    modes={latestPlayed.tour.modes}
                                    genre={latestPlayed.tour.genre}
                                    tourType={latestPlayed.tour.type}
                                    variant="grid"
                                    onPress={() => router.push({ pathname: '/tour/[id]', params: { id: latestPlayed.tour.id } })}
                                />
                            </View>
                        )}
                    </View>
                )}

                {/* Friends List */}
                <View style={styles.section}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <TextComponent variant="h3" bold>{t('newestFriends') || 'Newest Friends'}</TextComponent>
                        {(user?.stats?.friends || 0) > 3 && (
                            <TouchableOpacity onPress={() => router.push({ pathname: '/profile/user-friends', params: { userId: user?.id, userName: user?.name || user?.username } })}>
                                <TextComponent variant="body" bold color={theme.primary}>{t('seeAll') || 'See All'}</TextComponent>
                            </TouchableOpacity>
                        )}
                    </View>
                    {userFriends.length > 0 ? (
                        <View style={styles.friendsList}>
                            {userFriends.slice(0, 3).map((friend) => (
                                <FriendCard key={friend.id} friend={friend} />
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <TextComponent color={theme.textSecondary}>{t('noFriendsFound')}</TextComponent>
                        </View>
                    )}
                </View>

                <View style={styles.activitySection}>
                    <RecentAchievements
                        achievements={achievements}
                        onSeeAll={undefined}
                    />
                </View>
            </ScrollView>

            <View style={[styles.backButtonContainer, { top: insets.top + 10 }]} pointerEvents="box-none">
                <AnimatedPressable onPress={goBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </AnimatedPressable>
            </View>
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
        zIndex: 100,
        width: 50,
        height: 50,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 220,
        paddingBottom: 120,
    },
    profileSection: {
        gap: 20,
        marginBottom: 32,
    },
    actionButtonContainer: {
        marginBottom: 8,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    friendsList: {
        gap: 12,
    },
    emptyContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    activitySection: {
        marginTop: 8,
    },
});
