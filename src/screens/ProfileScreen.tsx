import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import SettingsItem from '../components/profileScreen/SettingsItem';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

type RootStackParamList = {
  Profile: undefined;
  AppPreferences: undefined;
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary }]}>
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
        onPress={() => navigation.navigate('AppPreferences')} // stack screen is static
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
  header: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subHeader: { fontSize: 14, marginBottom: 16 },
});
