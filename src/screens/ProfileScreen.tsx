import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  UserIcon
} from 'react-native-heroicons/outline';
import BuyTokensModal from '../components/profileScreen/BuyTokensModal';
import ProfileStats from '../components/profileScreen/ProfileStats';
import RecentAchievements from '../components/profileScreen/RecentAchievements';
import SettingsItem from '../components/profileScreen/SettingsItem';
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

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const { loadFriends, friends } = useFriends();

  React.useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  if (loading && !user) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <Text style={{ color: theme.textPrimary }}>Loading profile...</Text>
      </ScrollView>
    );
  }

  const progress = LevelSystem.getProgress(user?.xp || 0);


  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <TokenCard
        tokens={user?.tokens || 0}
        onBuyPress={() => setShowBuyTokens(true)}
        onInvitePress={() => console.log('Invite Friends pressed')}
      />

      <UserProfileCard
        name={user?.name || 'Guest'}
        level={progress.level}
        currentXP={progress.currentLevelXp}
        maxXP={progress.nextLevelXpStart}
        avatarUrl={user?.avatarUrl}
        onEditPress={() => router.push('/profile/personal-info')}
      />

      <ProfileStats
        toursDone={user?.playedTours?.length || 0}
        toursCreated={user?.createdTours?.length || 0}
        friends={friends.length}
        onPressToursDone={() => console.log('Navigate to tours done')}
        onPressToursCreated={() => console.log('Navigate to created tours')}
        onPressFriends={() => router.push('/(tabs)/friends')}
      />

      <RecentAchievements achievements={achievements} />

      <Text style={[styles.header, { color: theme.textPrimary }]}>{t('manageAccount')}</Text>

      <SettingsItem
        icon={<UserIcon size={24} color={theme.secondary} />}
        title={t('personalInfo')}
        onPress={() => router.push('/profile/personal-info')}
      />
      <SettingsItem
        icon={<Cog6ToothIcon size={24} color={theme.secondary} />}
        title={t('appPreferences')}
        onPress={() => router.push('/profile/preferences')}
      />
      <SettingsItem
        icon={<EnvelopeIcon size={24} color={theme.secondary} />}
        title={t('contact')}
        onPress={() => console.log('Contact pressed')}
      />
      <SettingsItem
        icon={<DocumentTextIcon size={24} color={theme.secondary} />}
        title={t('terms')}
        onPress={() => console.log('Terms & Conditions pressed')}
      />
      <SettingsItem
        icon={<QuestionMarkCircleIcon size={24} color={theme.secondary} />}
        title={t('faq')}
        onPress={() => console.log('FAQ pressed')}
      />

      <BuyTokensModal
        visible={showBuyTokens}
        onClose={() => setShowBuyTokens(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 4, paddingHorizontal: 16, marginTop: 24 },
  subHeader: { fontSize: 14, marginBottom: 16, paddingHorizontal: 16 },
});
