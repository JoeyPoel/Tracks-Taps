import AppHeader from '@/src/components/Header';
import { Stack } from 'expo-router';

import { ScreenWrapper } from '@/src/components/common/ScreenWrapper';
import ProfileStats from '@/src/components/profileScreen/ProfileStats';
import UserProfileCard from '@/src/components/profileScreen/UserProfileCard';
import { useTheme } from '@/src/context/ThemeContext';
import { userService } from '@/src/services/userService';
import { LevelSystem } from '@/src/utils/levelUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';


export default function FriendProfileScreen() {
    const { theme } = useTheme();
    const router = useRouter();
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
                <Text style={{ color: theme.textPrimary }}>User not found</Text>
            </ScreenWrapper>
        );
    }

    const progress = LevelSystem.getProgress(user.xp || 0);

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <Stack.Screen options={{ headerShown: false }} />
            <AppHeader showBackButton title="Profile" />


            <ScrollView contentContainerStyle={styles.content}>
                <UserProfileCard
                    name={user.name || 'Unknown'}
                    level={progress.level}
                    currentXP={progress.currentLevelXp}
                    maxXP={progress.nextLevelXpStart}
                    avatarUrl={user.avatarUrl}
                />

                <ProfileStats
                    toursDone={user.playedTours?.length || 0} // Assuming playedTours is returned or aggregated
                    totalPoints={user.xp || 0}
                    friends={0} // We might not get their friend count yet
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    content: { padding: 16 },
});
