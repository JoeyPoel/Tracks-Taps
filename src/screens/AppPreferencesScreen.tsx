import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/TranslationContext';

export default function AppPreferencesScreen() {
  const { theme, toggleTheme, mode } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { isAutoTranslateEnabled, setIsAutoTranslateEnabled, targetLanguage, setTargetLanguage } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', label: 'Polski', flag: '🇵🇱' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  ];

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <LinearGradient
        colors={[theme.accent + '20', theme.primary + '20']}
        style={styles.sectionIconContainer}
      >
        <Ionicons name={icon as any} size={18} color={theme.primary} />
      </LinearGradient>
      <TextComponent style={styles.sectionTitle} color={theme.textSecondary} bold variant="caption">{title}</TextComponent>
    </View>
  );

  return (
    <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false} withBottomTabs={true}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
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
              <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">{t('darkMode')}</TextComponent>
              <TextComponent style={styles.rowSubtitle} color={theme.textSecondary} variant="caption">
                {mode === 'dark' ? t('easyOnTheEyes') : t('brightAndClear')}
              </TextComponent>
            </View>
            <Switch
              value={mode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={mode === 'dark' ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.bgDisabled}
            />
          </View>
        </View>


        {/* Language Section */}
        {renderSectionHeader(t('language'), 'language-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.languageContainer}
          >
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
                  <TextComponent style={{ fontSize: 24, marginBottom: 4 }}>{lang.flag}</TextComponent>
                  <TextComponent
                    style={styles.languageLabel}
                    color={isActive ? theme.primary : theme.textPrimary}
                    bold={isActive}
                    variant="body"
                  >
                    {lang.label}
                  </TextComponent>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Auto Translation Toggle */}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, marginTop: 12 }]}>
          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.rowInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="language" size={16} color={theme.primary} style={{ marginRight: 8 }} />
                <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">{t('autoTranslateActiveTour')}</TextComponent>
              </View>
              <TextComponent style={styles.rowSubtitle} color={theme.textSecondary} variant="caption">
                {t('autoTranslateDesc')}
              </TextComponent>
            </View>
            <Switch
              value={isAutoTranslateEnabled}
              onValueChange={setIsAutoTranslateEnabled}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={isAutoTranslateEnabled ? theme.primary : '#f4f3f4'}
              ios_backgroundColor={theme.bgDisabled}
            />
          </View>

          {!isAutoTranslateEnabled && (
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSecondary, flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 8 }]}>
                  <TextComponent style={[styles.rowTitle, { marginBottom: 12 }]} color={theme.textPrimary} bold variant="body">Translate To</TextComponent>
                  <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={[styles.languageContainer, { padding: 0 }]}
                  >
                      {languages.map((lang, index) => {
                          const isActive = (targetLanguage || language) === lang.code;
                          return (
                              <AnimatedPressable
                                  key={lang.code}
                                  onPress={() => setTargetLanguage(lang.code as any)}
                                  style={[
                                      styles.languageOption,
                                      {
                                          backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                                          borderColor: isActive ? theme.primary : theme.borderSecondary,
                                          borderWidth: isActive ? 1.5 : 1
                                      }
                                  ]}
                              >
                                  <TextComponent style={{ fontSize: 24, marginBottom: 4 }}>{lang.flag}</TextComponent>
                                  <TextComponent
                                      style={styles.languageLabel}
                                      color={isActive ? theme.primary : theme.textPrimary}
                                      bold={isActive}
                                      variant="body"
                                  >
                                      {lang.label}
                                  </TextComponent>
                                  {isActive && (
                                      <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                                          <Ionicons name="checkmark" size={10} color="#FFF" />
                                      </View>
                                  )}
                              </AnimatedPressable>
                          );
                      })}
                  </ScrollView>
              </View>
          )}
        </View>

        {/* Notifications Mockup (Future Proofing) - Hidden for now
        {renderSectionHeader('Notifications', 'notifications-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={[styles.row, { borderBottomColor: theme.borderSecondary, borderBottomWidth: 1 }]}>
            <View style={styles.rowInfo}>
              <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">Push Notifications</TextComponent>
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
              <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">Email Updates</TextComponent>
            </View>
            <Switch
              value={false}
              onValueChange={() => { }}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>
        */}

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
    paddingBottom: 120,
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
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
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
