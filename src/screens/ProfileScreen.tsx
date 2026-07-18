import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  AcademicCapIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  TicketIcon,
  UserIcon,
  ChevronRightIcon
} from 'react-native-heroicons/outline';
import client from '../api/apiClient';
import { TextComponent } from '../components/common/TextComponent';
import Animated from 'react-native-reanimated';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { SettingsItem } from '../components/common/SettingsItem';
import BuyTokensModal from '../components/profileScreen/BuyTokensModal';
import ProfileStats from '../components/profileScreen/ProfileStats';
import RecentAchievements from '../components/profileScreen/RecentAchievements';
import ReferralClaimModal from '../components/profileScreen/ReferralClaimModal';
import TokenCard from '../components/profileScreen/TokenCard';
import UserProfileCard from '../components/profileScreen/UserProfileCard';
import { useLanguage } from '../context/LanguageContext';
import { useRevenueCat } from '../context/RevenueCatContext';
import { useTheme } from '../context/ThemeContext';
import { useTutorial } from '../context/TutorialContext';
import { useUserContext } from '../context/UserContext';
import { useFriends } from '../hooks/useFriends';
import { useInvites } from '../hooks/useInvites';
import { useStore } from '../store/store';
import { LevelSystem } from '../utils/levelUtils';
import { Ionicons } from '@expo/vector-icons';
import { userService } from '../services/userService';
import { useIsFocused } from '@react-navigation/native';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const isFocused = useIsFocused();
  const { speak, stop } = useTextToSpeech();
  const narrationMode = useStore(state => state.narrationMode);

  const { user, loading, refreshUser } = useUserContext();
  const { achievements, fetchAchievements, loadingAchievements } = useStore();
  const { loadFriends, friends } = useFriends();
  const { invites } = useInvites();
  const { isPro } = useRevenueCat();
  const { startTutorial } = useTutorial();
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const inviteCount = invites.length;

  // Load achievements once when profile loads (if not already loaded)
  useEffect(() => {
    if (user?.id && achievements.length === 0) {
      fetchAchievements(user.id);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refreshUser();
        loadFriends();
        
        // Fetch pending reviews count for admin
        if (user.isAdmin) {
          client.get(`/admin?action=stats&userId=${user.id}`)
            .then(res => {
              if (res.data?.tourStatusCounts?.PENDING_REVIEW !== undefined) {
                setPendingCount(res.data.tourStatusCounts.PENDING_REVIEW);
              }
            })
            .catch(err => console.error('Failed to load admin stats for badge:', err));
        }

        // Fetch user's created tours to check for rejected ones
        userService.getUserCreatedTours(user.id)
          .then(res => {
            const data = res.data && Array.isArray(res.data) ? res.data : res;
            if (Array.isArray(data)) {
              const count = data.filter((t: any) => t.status === 'REJECTED').length;
              setRejectedCount(count);
            }
          })
          .catch(err => console.error('Failed to load user created tours for rejected count:', err));
      }
    }, [user?.id, user?.isAdmin, refreshUser, loadFriends])
  );

  const progress = LevelSystem.getProgress(user?.xp || 0);

  React.useEffect(() => {
    if (isFocused && narrationMode === 'full') {
      const formatString = require('../utils/stringUtils').formatString;
      let speechText = t('narrationProfileScreenIntro') + ' ';
      if (!user) {
        speechText += t('narrationProfileNotLoggedIn');
      } else {
        speechText += formatString(t('narrationProfileUserInfo'), user.name || 'Guest', progress.level, progress.currentLevelXp, progress.nextLevelXpStart) + ' ';
        speechText += formatString(t('narrationProfileStats'), user?.stats?.toursDone || 0, user?.stats?.toursCreated || 0, friends.length, user?.stats?.reviews || 0, user?.tokens || 0) + ' ';
        if (rejectedCount > 0) speechText += formatString(t('narrationProfileAttentionWarning'), rejectedCount) + ' ';
        if (inviteCount > 0) speechText += formatString(t('narrationProfilePendingInvites'), inviteCount) + ' ';
        if (achievements && achievements.length > 0) {
          const achNames = achievements.slice(0, 3).map((a: any) => a.name).join(', ');
          speechText += formatString(t('narrationProfileRecentAchievements'), achNames) + ' ';
        }
        speechText += t('narrationProfileManageAccountOptions');
      }
      speak(speechText);
    }
    return () => {
      stop();
    };
    // Only re-fire when the screen is focused or narration mode changes — not on every data refresh
  }, [isFocused, narrationMode, user?.id]);

  if (loading && !user) {
    return (
      <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <TextComponent style={{ color: theme.textPrimary }}>Loading profile...</TextComponent>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={true} includeBottom={false} animateEntry={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <Animated.View style={{ marginTop: 24 }}>
          <UserProfileCard
            name={user?.name || 'Guest'}
            level={progress.level}
            currentXP={progress.currentLevelXp}
            maxXP={progress.nextLevelXpStart}
            avatarUrl={user?.avatarUrl}
            onEditPress={() => {
              if (user) {
                router.push('/profile/personal-info');
              } else {
                // Trigger Auth Modal or Navigate to Auth
                router.push('/auth/login');
              }
            }}
          />
        </Animated.View>

        {!user && (
          <Animated.View style={{ marginTop: 24, padding: 20, backgroundColor: theme.bgSecondary, borderRadius: 16, alignItems: 'center' }}>
            <TextComponent style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{t('createAccount') || 'Create Account'}</TextComponent>
            <TextComponent style={{ color: theme.textSecondary, marginBottom: 16, textAlign: 'center' }}>
              Join to track your progress, save tours, and compete with friends!
            </TextComponent>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <AnimatedButton title={t('login') || "Log In"} onPress={() => router.push('/auth/login')} style={{ flex: 1 }} variant="primary" />
              <AnimatedButton title="Sign Up" onPress={() => router.push('/auth/register')} style={{ flex: 1 }} variant="outline" />
            </View>
          </Animated.View>
        )}

        {/* Horizontal Stats or Tokens - Only for Users */}
        {user && (
          <Animated.View style={{ marginTop: 24 }}>
            <ProfileStats
              toursDone={user?.stats?.toursDone || 0}
              toursCreated={user?.stats?.toursCreated || 0}
              friends={friends.length}
              reviews={user?.stats?.reviews || 0}
              onPressToursDone={() => router.push({ pathname: '/profile/tours-done', params: { type: 'done', title: t('toursDone') } })}
              onPressToursCreated={() => router.push({ pathname: '/profile/tours-created', params: { type: 'created', title: t('toursCreated') } })}
              onPressFriends={() => router.push('/profile/friends')}
              onPressReviews={() => router.push({ pathname: '/profile/tours-done', params: { type: 'reviews', title: t('myReviews') || 'My Reviews' } })}
            />
          </Animated.View>
        )}

        {user && rejectedCount > 0 && (
          <TouchableOpacity 
            style={[styles.notificationBanner, { backgroundColor: theme.danger + '15', borderColor: theme.danger }]}
            onPress={() => router.push({ pathname: '/profile/tours-created', params: { type: 'created', title: t('toursCreated') } })}
          >
            <Ionicons name="warning" size={20} color={theme.danger} />
            <TextComponent variant="caption" bold color={theme.textPrimary} style={{ marginLeft: 8, flex: 1 }}>
              {rejectedCount === 1 
                ? "You have 1 tour that needs attention! Tap to view." 
                : `You have ${rejectedCount} tours that need attention! Tap to view.`}
            </TextComponent>
            <ChevronRightIcon size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        )}

        {user && inviteCount > 0 && (
          <TouchableOpacity
            style={[styles.notificationBanner, { backgroundColor: theme.primary + '18', borderColor: theme.primary }]}
            onPress={() => router.push({ pathname: '/profile/friends', params: { initialTab: 'requests' } } as any)}
          >
            <Ionicons name="mail-unread" size={20} color={theme.primary} />
            <TextComponent variant="caption" bold color={theme.textPrimary} style={{ marginLeft: 8, flex: 1 }}>
              {inviteCount === 1
                ? t('tourInviteBannerOne')
                : (t('tourInviteBannerMany') || '').replace('{0}', String(inviteCount))}
            </TextComponent>
            <ChevronRightIcon size={16} color={theme.primary} />
          </TouchableOpacity>
        )}

        {user && (
          <Animated.View style={{ marginTop: 32 }}>
            <TokenCard
              tokens={user?.tokens || 0}
              onBuyPress={() => setShowBuyTokens(true)}
              onInvitePress={() => setShowBuyTokens(true)}
            />
          </Animated.View>
        )}

        {user && (
          <Animated.View style={{ marginTop: 32 }}>
            <RecentAchievements
              achievements={achievements}
              loading={loadingAchievements}
              onSeeAll={() => router.push('/profile/achievements')}
            />
          </Animated.View>
        )}

        {/* Grouped Settings Section */}
        <Animated.View style={{ marginTop: 40 }}>
          <TextComponent style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('manageAccount')?.toUpperCase() || 'MANAGE ACCOUNT'}</TextComponent>

          <View style={[styles.settingsGroup, { backgroundColor: theme.bgSecondary }]}>
            {user && (
              <>
                {user.isAdmin && (
                  <SettingsItem
                    icon={<ShieldCheckIcon size={22} color={theme.accent} />}
                    title="Admin Panel"
                    onPress={() => router.push('/profile/admin-panel')}
                    rightElement={
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {pendingCount > 0 && (
                          <View style={{ backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                            <TextComponent variant="caption" bold color={theme.textOnPrimary}>
                              {pendingCount}
                            </TextComponent>
                          </View>
                        )}
                        <ChevronRightIcon size={20} color={theme.textSecondary} />
                      </View>
                    }
                  />
                )}

                <SettingsItem
                  icon={<TicketIcon size={22} color={theme.accent} />}
                  title={t('enterReferralCode') || 'Enter Referral Code'}
                  onPress={() => setShowReferralModal(true)}
                />

                <SettingsItem
                  icon={<UserIcon size={22} color={theme.primary} />}
                  title={t('personalInfo')}
                  onPress={() => router.push('/profile/personal-info')}
                />
                <SettingsItem
                  icon={<HeartIcon size={22} color={theme.primary} />}
                  title={t('savedTrips') || 'Saved Trips'}
                  onPress={() => router.push('/profile/saved-trips' as any)}
                />
                <SettingsItem
                  icon={<Cog6ToothIcon size={22} color={theme.primary} />}
                  title={t('appPreferences')}
                  onPress={() => router.push('/profile/preferences')}
                />
              </>
            )}

            <SettingsItem
              icon={<EnvelopeIcon size={22} color={theme.primary} />}
              title={t('contact')}
              onPress={async () => {
                try {
                  await Linking.openURL('mailto:Tracks.taps@gmail.com');
                } catch (error) {
                  console.error('Error opening email client:', error);
                }
              }}
            />
            <SettingsItem
              icon={<DocumentTextIcon size={22} color={theme.primary} />}
              title={t('terms')}
              onPress={() => router.push('/profile/terms' as any)}
            />
            <SettingsItem
              icon={<QuestionMarkCircleIcon size={22} color={theme.primary} />}
              title={t('faq')}
              onPress={() => router.push('/profile/faq')}
            />
            <SettingsItem
              icon={<AcademicCapIcon size={22} color={theme.primary} />}
              title={t('replayTutorial') || 'Replay Tutorial'}
              onPress={startTutorial}
              showBorder={false}
            />
          </View>
        </Animated.View>

      </ScrollView>

      <BuyTokensModal
        visible={showBuyTokens}
        onClose={() => setShowBuyTokens(false)}
      />
      <ReferralClaimModal
        visible={showReferralModal}
        onClose={() => setShowReferralModal(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
    paddingLeft: 4,
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 4,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
});
