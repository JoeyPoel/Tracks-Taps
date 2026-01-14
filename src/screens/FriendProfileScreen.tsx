import { AnimatedPressable } from '@/src/components/common/AnimatedPressable';
import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import UserProfileCard from '@/src/components/profileScreen/UserProfileCard';
import ProfileSkeleton from '@/src/components/skeletons/ProfileSkeleton';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { userService } from '@/src/services/userService';
import { LevelSystem } from '@/src/utils/levelUtils';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileStats from '../components/profileScreen/ProfileStats';
import RecentAchievements from '../components/profileScreen/RecentAchievements';
import { achievementService } from '../services/achievementService';

import { useSafeNavigation } from '../hooks/useSafeNavigation';

export default function FriendProfileScreen() {
    const { theme } = useTheme();
    const { goBack } = useSafeNavigation();
    const { t } = useLanguage();
    const { userId } = useLocalSearchParams();
    const [user, setUser] = useState<any>(null);
    const [achievements, setAchievements] = useState<any[]>([]); // New state
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

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
                    source={require('../../assets/images/profilePictureFallback.png')} // Fallback or user cover
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
                    <AnimatedPressable onPress={goBack} style={styles.backButton}>
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

                    {/* Shared Profile Stats Component */}
                    <ProfileStats
                        toursDone={user?.playedTours?.length || 0}
                        toursCreated={user?.createdTours?.length || 0}
                        friends={user?.friends?.length || 0}
                        // Connect these to actual detail pages if desired, or leave null for display only
                        onPressToursDone={undefined}
                        onPressToursCreated={undefined}
                        onPressFriends={undefined}
                    />
                </View>

                {/* Achievements Section - Real Data */}
                <View style={styles.activitySection}>
                    <RecentAchievements
                        achievements={achievements}
                        // Hide "See All" for friend profiles unless we have a route for it
                        onSeeAll={undefined}
                    />
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
        paddingBottom: 120,
    },
    profileSection: {
        gap: 20,
        marginBottom: 32,
    },
    activitySection: {
        marginTop: 8,
    },
});
