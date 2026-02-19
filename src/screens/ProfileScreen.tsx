import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AcademicCapIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  TicketIcon,
  UserIcon
} from 'react-native-heroicons/outline';
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
import { useStore } from '../store/store';
import { LevelSystem } from '../utils/levelUtils';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const { user, loading, refreshUser } = useUserContext();
  const { achievements, fetchAchievements, loadingAchievements } = useStore();
  const { loadFriends, friends } = useFriends();
  const { isPro } = useRevenueCat();
  const { startTutorial } = useTutorial();

  // Load achievements once when profile loads (if not already loaded)
  useEffect(() => {
    if (user?.id && achievements.length === 0) {
      fetchAchievements(user.id);
    }
  }, [user?.id]); // Only dependency is user.id, so it runs once per user login essentially

  useFocusEffect(
    useCallback(() => {
      if (user) {
        refreshUser();
        loadFriends();
      }
    }, [user]) // Added user dependency
  );

  if (loading && !user) {
    return (
      <ScreenWrapper style={{ backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.textPrimary }}>Loading profile...</Text>
      </ScreenWrapper>
    );
  }

  const progress = LevelSystem.getProgress(user?.xp || 0);

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
            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{t('createAccount') || 'Create Account'}</Text>
            <Text style={{ color: theme.textSecondary, marginBottom: 16, textAlign: 'center' }}>
              Join to track your progress, save tours, and compete with friends!
            </Text>
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
              onPressToursDone={() => router.push({ pathname: '/profile/tours-done', params: { type: 'done', title: t('toursDone') } })}
              onPressToursCreated={() => router.push({ pathname: '/profile/tours-created', params: { type: 'created', title: t('toursCreated') } })}
              onPressFriends={() => router.push('/profile/friends')}
            />
          </Animated.View>
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
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('manageAccount')?.toUpperCase() || 'MANAGE ACCOUNT'}</Text>


          <View style={[styles.settingsGroup, { backgroundColor: theme.bgSecondary }]}>
            {/* Subscription Logic Removed as per user request */}
            {/* <SettingsItem
              icon={<SparklesIcon size={22} color={theme.accent} />}
              title={isPro ? ((t('manageSubscription') as string) || 'Manage Subscription') : ((t('becomePro') as string) || 'Become a Pro Member')}
              onPress={() => router.push(isPro ? '/customer-center' : '/paywall' as any)}
            /> */}

            {user && (
              <>
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
    paddingBottom: 120, // Standardized
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
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 4, // Spacing for shadow
  },

});
