import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  UserIcon
} from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import BuyTokensModal from '../components/profileScreen/BuyTokensModal';
import ProfileStats from '../components/profileScreen/ProfileStats';
import RecentAchievements from '../components/profileScreen/RecentAchievements';
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

  const { user, loading } = useUserContext();
  const { achievements, loadAchievements } = useAchievements();
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

  const SettingsRow = ({ icon, title, onPress, showBorder = true }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.settingsRow,
        {
          borderBottomColor: theme.borderSecondary,
          borderBottomWidth: showBorder ? 1 : 0
        }
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {icon}
        <Text style={[styles.settingsLabel, { color: theme.textPrimary }]}>{title}</Text>
      </View>
      <ChevronRightIcon size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={true} includeBottom={false} animateEntry={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Card */}
        <Animated.View entering={FadeInDown.duration(500)} style={{ marginTop: 8 }}>
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
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {/* We can put small stats here if needed, or keeping the horizontal stats component */}
          </View>

          <ProfileStats
            toursDone={user?.playedTours?.length || 0}
            toursCreated={user?.createdTours?.length || 0}
            friends={friends.length}
            onPressToursDone={() => console.log('Navigate to tours done')}
            onPressToursCreated={() => console.log('Navigate to created tours')}
            onPressFriends={() => router.push('/friends')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ marginTop: 24 }}>
          <TokenCard
            tokens={user?.tokens || 0}
            onBuyPress={() => setShowBuyTokens(true)}
            onInvitePress={() => console.log('Invite Friends pressed')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ marginTop: 24 }}>
          <RecentAchievements
            achievements={achievements}
            onSeeAll={() => router.push('/profile/achievements')}
          />
        </Animated.View>

        {/* Grouped Settings Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={{ marginTop: 32 }}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('manageAccount')?.toUpperCase() || 'MANAGE ACCOUNT'}</Text>

          <View style={[styles.settingsGroup, { backgroundColor: theme.bgSecondary }]}>
            <SettingsRow
              icon={<UserIcon size={22} color={theme.primary} />}
              title={t('personalInfo')}
              onPress={() => router.push('/profile/personal-info')}
            />
            <SettingsRow
              icon={<Cog6ToothIcon size={22} color={theme.primary} />}
              title={t('appPreferences')}
              onPress={() => router.push('/profile/preferences')}
            />
            <SettingsRow
              icon={<EnvelopeIcon size={22} color={theme.primary} />}
              title={t('contact')}
              onPress={() => console.log('Contact pressed')}
            />
            <SettingsRow
              icon={<DocumentTextIcon size={22} color={theme.primary} />}
              title={t('terms')}
              onPress={() => console.log('Terms & Conditions pressed')}
            />
            <SettingsRow
              icon={<QuestionMarkCircleIcon size={22} color={theme.primary} />}
              title={t('faq')}
              onPress={() => console.log('FAQ pressed')}
              showBorder={false}
            />
          </View>
        </Animated.View>

      </ScrollView>

      <BuyTokensModal
        visible={showBuyTokens}
        onClose={() => setShowBuyTokens(false)}
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
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsGroup: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
  }
});
