import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HeartIcon,
  QuestionMarkCircleIcon,
  TicketIcon,
  UserIcon
} from 'react-native-heroicons/outline';
import Animated from 'react-native-reanimated';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { SettingsItem } from '../components/common/SettingsItem';
import BuyTokensModal from '../components/profileScreen/BuyTokensModal';
import ProfileStats from '../components/profileScreen/ProfileStats';
import RecentAchievements from '../components/profileScreen/RecentAchievements';
import ReferralClaimModal from '../components/profileScreen/ReferralClaimModal';
import TokenCard from '../components/profileScreen/TokenCard';
import UserProfileCard from '../components/profileScreen/UserProfileCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useAchievements } from '../hooks/useAchievements';
import { useFriends } from '../hooks/useFriends';
import { LevelSystem } from '../utils/levelUtils';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const { user, loading } = useUserContext();
  const { achievements, loadAchievements, loading: achievementsLoading } = useAchievements();
  const { loadFriends, friends } = useFriends();

  useEffect(() => {
    loadAchievements();
    loadFriends();
  }, [loadAchievements, loadFriends]);

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
            onEditPress={() => router.push('/profile/personal-info')}
          />
        </Animated.View>

        {/* Horizontal Stats or Tokens */}
        <Animated.View style={{ marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* We can put small stats here if needed, or keeping the horizontal stats component */}
          </View>

          <ProfileStats
            toursDone={user?.stats?.toursDone || 0}
            toursCreated={user?.stats?.toursCreated || 0}
            friends={friends.length}
            onPressToursDone={() => router.push({ pathname: '/profile/tours-done', params: { type: 'done', title: t('toursDone') } })}
            onPressToursCreated={() => router.push({ pathname: '/profile/tours-created', params: { type: 'created', title: t('toursCreated') } })}
            onPressFriends={() => router.push('/profile/friends')}
          />
        </Animated.View>

        <Animated.View style={{ marginTop: 32 }}>
          <TokenCard
            tokens={user?.tokens || 0}
            onBuyPress={() => setShowBuyTokens(true)}
            onInvitePress={() => setShowBuyTokens(true)}
          />
        </Animated.View>

        <Animated.View style={{ marginTop: 32 }}>
          <RecentAchievements
            achievements={achievements}
            loading={achievementsLoading}
            onSeeAll={() => router.push('/profile/achievements')}
          />
        </Animated.View>

        {/* Grouped Settings Section */}
        <Animated.View style={{ marginTop: 40 }}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('manageAccount')?.toUpperCase() || 'MANAGE ACCOUNT'}</Text>

          <View style={[styles.settingsGroup, { backgroundColor: theme.bgSecondary }]}>
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
