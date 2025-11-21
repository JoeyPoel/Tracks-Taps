import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { lightTheme } from '@/src/theme/theme';
import SettingsItem from '../components/profileScreen/SettingsItem';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Profile: undefined;
  AppPreferences: undefined;
};

export default function ProfileScreen() {
  const theme = lightTheme;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>Profile</Text>
      <Text style={[styles.subHeader, { color: theme.textSecondary }]}>Manage your account</Text>

      <SettingsItem
        icon={<Ionicons name="person-outline" size={24} color={theme.secondary} />}
        title="Personal Information"
        onPress={() => console.log('Personal Information pressed')}
      />
      <SettingsItem
        icon={<Ionicons name="settings" size={24} color={theme.secondary} />}
        title="App Preferences"
        onPress={() => navigation.navigate('AppPreferences')}
      />
      <SettingsItem
        icon={<MaterialIcons name="email" size={24} color={theme.secondary} />}
        title="Contact"
        onPress={() => console.log('Contact pressed')}
      />
      <SettingsItem
        icon={<Entypo name="text-document" size={24} color={theme.secondary} />}
        title="Terms & Conditions"
        onPress={() => console.log('Terms & Conditions pressed')}
      />
      <SettingsItem
        icon={<Ionicons name="help-circle-outline" size={24} color={theme.secondary} />}
        title="Frequently Asked Questions"
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