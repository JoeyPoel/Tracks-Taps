import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AppHeader from '../components/Header';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { darkTheme } from '../context/theme';

export default function AppPreferencesScreen() {
  const { theme, toggleTheme, mode } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  ];

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={[theme.accent + '20', theme.primary + '20']}
        style={styles.sectionIconContainer}
      >
        <Ionicons name={icon as any} size={18} color={theme.primary} />
      </LinearGradient>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader
        showBackButton
        title={t('appPreferences')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        {renderSectionHeader(t('appearance'), 'color-palette-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>{t('darkMode')}</Text>
              <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                {mode === 'dark' ? t('easyOnTheEyes') : t('brightAndClear')}
              </Text>
            </View>
            <Switch
              value={theme === darkTheme}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={theme === darkTheme ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.bgDisabled}
            />
          </View>
        </View>

        {/* Language Section */}
        {renderSectionHeader(t('language'), 'language-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={styles.languageContainer}>
            {languages.map((lang, index) => {
              const isActive = language === lang.code;
              return (
                <AnimatedPressable
                  key={lang.code}
                  onPress={() => setLanguage(lang.code as any)}
                  style={[
                    styles.languageOption,
                    {
                      backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                      borderColor: isActive ? theme.primary : theme.borderSecondary,
                      borderWidth: isActive ? 1.5 : 1
                    }
                  ]}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{lang.flag}</Text>
                  <Text style={[
                    styles.languageLabel,
                    {
                      color: isActive ? theme.primary : theme.textPrimary,
                      fontWeight: isActive ? 'bold' : 'normal'
                    }
                  ]}
                  >
                    {lang.label}
                  </Text>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        {/* Notifications Mockup (Future Proofing) */}
        {renderSectionHeader('Notifications', 'notifications-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={[styles.row, { borderBottomColor: theme.borderSecondary, borderBottomWidth: 1 }]}>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Push Notifications</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => { }}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={theme.primary}
            />
          </View>
          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Email Updates</Text>
            </View>
            <Switch
              value={false}
              onValueChange={() => { }}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <Text style={[styles.versionText, { color: theme.textTertiary }]}>
          Version 1.0.0
        </Text>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowInfo: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 13,
  },
  languageContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  languageOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    position: 'relative',
  },
  languageLabel: {
    fontSize: 14,
  },
  activeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 20,
  },
});
