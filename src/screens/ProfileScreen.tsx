import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import SettingsItem from '../components/profileScreen/SettingsItem';
import UserProfileCard from '../components/profileScreen/UserProfileCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../hooks/useUser';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { t } = useLanguage();

  const { user, loading } = useUser('joey@example.com');

  if (loading) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <Text style={{ color: theme.textPrimary }}>Loading profile...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <UserProfileCard
        name={user?.name || 'Guest'}
        level={user?.level || 1}
        levelProgress={0} // This would need a calculation based on score/level logic
        avatarUrl="https://i.pravatar.cc/200?img=12" // Placeholder or from DB if added
        points={user?.score || 0}
        completedTours={user?.participations?.filter((p: { status: string }) => p.status === 'COMPLETED').length || 0}
        createdTours={user?.createdTours?.length || 0}
        onEditPress={() => console.log('Edit profile pressed')}
      />

      <Text style={[styles.header, { color: theme.textPrimary }]}>{t('profile')}</Text>
      <Text style={[styles.subHeader, { color: theme.textSecondary }]}>{t('manageAccount')}</Text>

      <SettingsItem
        icon={<Ionicons name="person-outline" size={24} color={theme.secondary} />}
        title={t('personalInfo')}
        onPress={() => console.log('Personal Information pressed')}
      />
      <SettingsItem
        icon={<Ionicons name="settings" size={24} color={theme.secondary} />}
        title={t('appPreferences')}
        onPress={() => router.push('/preferences')} // stack screen is static
      />
      <SettingsItem
        icon={<MaterialIcons name="email" size={24} color={theme.secondary} />}
        title={t('contact')}
        onPress={() => console.log('Contact pressed')}
      />
      <SettingsItem
        icon={<Entypo name="text-document" size={24} color={theme.secondary} />}
        title={t('terms')}
        onPress={() => console.log('Terms & Conditions pressed')}
      />
      <SettingsItem
        icon={<Ionicons name="help-circle-outline" size={24} color={theme.secondary} />}
        title={t('faq')}
        onPress={() => console.log('FAQ pressed')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 4, paddingHorizontal: 16, marginTop: 24 },
  subHeader: { fontSize: 14, marginBottom: 16, paddingHorizontal: 16 },
});
