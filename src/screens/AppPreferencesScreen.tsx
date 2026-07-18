import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, View, TextInput, FlatList, Pressable, Dimensions } from 'react-native';
import { AppModal } from '../components/common/AppModal';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { LanguagePickerModal } from '../components/common/LanguagePickerModal';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation, SUPPORTED_TRANSLATION_LANGUAGES } from '../context/TranslationContext';
import { COLOR_THEMES } from '../constants/themes';
import { useStore } from '../store/store';
import { darkTheme, lightTheme } from '../context/theme';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useIsFocused } from '@react-navigation/native';
import { useTutorial } from '../context/TutorialContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AppPreferencesScreen() {
  const { theme, toggleTheme, mode, performTransition } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { isAutoTranslateEnabled, setIsAutoTranslateEnabled, targetLanguage, setTargetLanguage } = useTranslation();
  const [isLangModalVisible, setIsLangModalVisible] = React.useState(false);
  const { speak } = useTextToSpeech();
  
  const user = useStore(state => state.user);
  const updateUser = useStore(state => state.updateUser);
  const narrationMode = useStore(state => state.narrationMode);
  const setNarrationMode = useStore(state => state.setNarrationMode);
  const speechRate = useStore(state => state.speechRate);
  const setSpeechRate = useStore(state => state.setSpeechRate);
  const showSpeakButtons = useStore(state => state.showSpeakButtons);
  const setShowSpeakButtons = useStore(state => state.setShowSpeakButtons);
  const fontScale = useStore(state => state.fontScale);
  const setFontScale = useStore(state => state.setFontScale);
  const isFocused = useIsFocused();
  const { isActive: isTutorialActive, steps, currentStepIndex } = useTutorial();
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Scroll to Accessibility section during tutorial onboarding
  React.useEffect(() => {
    if (isTutorialActive && steps[currentStepIndex]?.id === 'accessibility_settings') {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 440, animated: true });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTutorialActive, currentStepIndex]);

  // Auto-narrate the screen on focus
  React.useEffect(() => {
    if (isFocused && narrationMode === 'full') {
      speak(t('narrationAppPreferencesScreen'));
    }
  }, [isFocused, narrationMode, language]);

  const switchRef = React.useRef<View>(null);
  const [switchCoords, setSwitchCoords] = React.useState<{ cx: number; cy: number } | null>(null);
  const [localDark, setLocalDark] = React.useState(mode === 'dark');

  React.useEffect(() => {
    setLocalDark(mode === 'dark');
  }, [mode]);

  const measureSwitch = () => {
    if (switchRef.current) {
      switchRef.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setSwitchCoords({
            cx: x + width / 2,
            cy: y + height / 2,
          });
        }
      });
    }
  };

  const handleThemeSelect = async (themeId: string | null, event?: any) => {
    if (!user?.id) return;

    const startingPoint = event ? {
      cx: event.nativeEvent.pageX,
      cy: event.nativeEvent.pageY
    } : undefined;

    let targetBg = theme.bgPrimary;
    if (themeId) {
      const themeConfig = COLOR_THEMES.find(t => t.id === themeId);
      if (themeConfig) {
        const overrides = mode === 'dark' ? themeConfig.dark : themeConfig.light;
        const base = mode === 'dark' ? darkTheme : lightTheme;
        targetBg = overrides.bgPrimary || base.bgPrimary;
      }
    } else {
      targetBg = mode === 'dark' ? darkTheme.bgPrimary : lightTheme.bgPrimary;
    }

    performTransition(async () => {
      try {
        await updateUser(user.id!, { customTheme: themeId });
      } catch (e) {
        console.warn('Failed to update custom theme preference:', e);
      }
    }, startingPoint, targetBg);
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Spanish', flag: '🇪🇸' },
    { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
    { code: 'pl', label: 'Polish', flag: '🇵🇱' },
    { code: 'fr', label: 'French', flag: '🇫🇷' },
    { code: 'de', label: 'German', flag: '🇩🇪' },
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
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        {renderSectionHeader(t('appearance'), 'color-palette-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.rowInfo}>
              <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">{mode === 'dark' ? t('darkMode') : t('lightMode')}</TextComponent>
              <TextComponent style={styles.rowSubtitle} color={theme.textSecondary} variant="caption">
                {mode === 'dark' ? t('easyOnTheEyes') : t('brightAndClear')}
              </TextComponent>
            </View>
            <View
              ref={switchRef}
              onLayout={measureSwitch}
              collapsable={false}
            >
              <Switch
                value={localDark}
                onValueChange={(val) => {
                  setLocalDark(val);
                  measureSwitch();
                  toggleTheme(switchCoords || { cx: SCREEN_WIDTH - 45, cy: 145 });
                }}
                trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
                thumbColor={mode === 'dark' ? theme.primary : '#f4f3f4'}
                ios_backgroundColor={theme.bgDisabled}
              />
            </View>
          </View>
        </View>

        {/* Custom Theme Section */}
        {renderSectionHeader(t('customThemes') || 'Custom Themes', 'brush-outline')}
        {!user ? (
          <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, padding: 20, alignItems: 'center' }]}>
            <Ionicons name="brush-outline" size={32} color={theme.textTertiary} style={{ marginBottom: 10 }} />
            <TextComponent style={{ textAlign: 'center', marginBottom: 6 }} color={theme.textPrimary} bold variant="body">
              Personalize Your Experience
            </TextComponent>
            <TextComponent style={{ textAlign: 'center', marginBottom: 16 }} color={theme.textSecondary} variant="caption">
              Sign in to unlock 10 premium custom color themes and save your preferences.
            </TextComponent>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
            <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
              <TextComponent color={theme.textSecondary} variant="caption">
                Select a custom color palette to skin the app.
              </TextComponent>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.themeScrollContainer}
            >
              {/* Default Theme Card */}
              {(() => {
                const isActive = !user.customTheme;
                const colors: [string, string] = mode === 'dark' 
                  ? ['#1E293B', '#0F172A'] // Slate/Dark default representation
                  : ['#FFFFFF', '#F8FAFC']; // White/Light default representation
                
                return (
                  <AnimatedPressable
                    onPress={(e) => handleThemeSelect(null, e)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                        borderColor: isActive ? theme.primary : theme.borderSecondary,
                        borderWidth: isActive ? 1.5 : 1
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={colors}
                      style={styles.themeColorCircle}
                    />
                    <TextComponent
                      style={styles.themeLabel}
                      color={isActive ? theme.primary : theme.textPrimary}
                      bold={isActive}
                      variant="caption"
                      numberOfLines={1}
                    >
                      Default
                    </TextComponent>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                      </View>
                    )}
                  </AnimatedPressable>
                );
              })()}

              {/* 10 Other Themes */}
              {COLOR_THEMES.filter(tc => !tc.id.endsWith('_accessibility')).map((themeConfig) => {
                const isActive = user.customTheme === themeConfig.id;
                const config = mode === 'dark' ? themeConfig.dark : themeConfig.light;
                const colors: [string, string] = [
                  config.primary || theme.primary,
                  config.secondary || config.primary || theme.secondary
                ];

                return (
                  <AnimatedPressable
                    key={themeConfig.id}
                    onPress={(e) => handleThemeSelect(themeConfig.id, e)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                        borderColor: isActive ? theme.primary : theme.borderSecondary,
                        borderWidth: isActive ? 1.5 : 1
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={colors}
                      style={styles.themeColorCircle}
                    />
                    <TextComponent
                      style={styles.themeLabel}
                      color={isActive ? theme.primary : theme.textPrimary}
                      bold={isActive}
                      variant="caption"
                      numberOfLines={1}
                    >
                      {themeConfig.name}
                    </TextComponent>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                      </View>
                    )}
                  </AnimatedPressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* App Interface Language Section */}
        {renderSectionHeader(t('appInterfaceLanguage'), 'language-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
            <TextComponent color={theme.textSecondary} variant="caption">
              {t('appLanguageDescription')}
            </TextComponent>
          </View>
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
                      <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Translation Service Section */}
        {renderSectionHeader(t('translationService'), 'sync-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={[styles.row, styles.lastRow]}>
            <View style={styles.rowInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                <Ionicons name="language" size={16} color={theme.primary} style={{ marginRight: 8 }} />
                <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">{t('autoTranslateActiveTour')}</TextComponent>
              </View>
              <TextComponent style={styles.rowSubtitle} color={theme.textSecondary} variant="caption">
                {t('translationServiceDescription')}
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

          {isAutoTranslateEnabled && (
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSecondary, flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 16 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="flag-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
                      <TextComponent style={styles.rowTitle} color={theme.textPrimary} bold variant="body">{t('translateTo') || 'Translate To'}</TextComponent>
                    </View>
                    <AnimatedPressable 
                        onPress={() => setIsLangModalVisible(true)}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: theme.primary + '15' }}
                    >
                        <TextComponent color={theme.primary} bold variant="caption">{t('change') || 'Change'}</TextComponent>
                    </AnimatedPressable>
                  </View>
                  
                  <AnimatedPressable 
                    onPress={() => setIsLangModalVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.bgPrimary, padding: 12, borderRadius: 16, width: '100%', borderWidth: 1, borderColor: theme.borderSecondary }}
                  >
                      <TextComponent style={{ fontSize: 24, marginRight: 12 }}>
                          {SUPPORTED_TRANSLATION_LANGUAGES.find(l => l.code === (targetLanguage || language))?.flag || '🌍'}
                      </TextComponent>
                      <View style={{ flex: 1 }}>
                          <TextComponent color={theme.textPrimary} bold variant="body">
                              {SUPPORTED_TRANSLATION_LANGUAGES.find(l => l.code === (targetLanguage || language))?.label || (targetLanguage || language)}
                          </TextComponent>
                          <TextComponent color={theme.textSecondary} variant="caption">
                              {t('translationServiceDescription')}
                          </TextComponent>
                      </View>
                  </AnimatedPressable>
              </View>
          )}
        </View>

        {/* Language Selection Modal */}
        <LanguagePickerModal 
            visible={isLangModalVisible}
            onClose={() => setIsLangModalVisible(false)}
            showManagePreferencesHint={false} 
        />

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

        {/* Accessibility Narration Section */}
        {renderSectionHeader(t('accessibilityNarration' as any) || 'Accessibility Narration', 'volume-medium-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
            <TextComponent color={theme.textSecondary} variant="caption">
              {t('accessibilityNarrationDesc')}
            </TextComponent>
          </View>
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
            {[
              { id: 'off', label: t('off'), desc: t('noNarration') },
              { id: 'tour-only', label: t('tourOnly'), desc: t('duringTours') },
              { id: 'full', label: t('fullApp'), desc: t('narrateAllScreens') },
            ].map((modeOpt) => {
              const isActive = narrationMode === modeOpt.id;
              return (
                <Pressable
                  key={modeOpt.id}
                  onPress={() => {
                    setNarrationMode(modeOpt.id as any);
                    const formatString = require('../utils/stringUtils').formatString;
                    speak(formatString(t('narrationModeChangedTo'), modeOpt.label), true);
                  }}
                  style={[
                    styles.themeOption,
                    {
                      flex: 1,
                      backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                      borderColor: isActive ? theme.primary : theme.borderSecondary,
                      borderWidth: isActive ? 1.5 : 1,
                      paddingVertical: 10,
                      borderRadius: 14,
                    }
                  ]}
                >
                  <Ionicons 
                    name={modeOpt.id === 'off' ? 'volume-mute-outline' : modeOpt.id === 'tour-only' ? 'walk-outline' : 'megaphone-outline'} 
                    size={22} 
                    color={isActive ? theme.primary : theme.textSecondary} 
                    style={{ marginBottom: 6 }}
                  />
                  <TextComponent color={isActive ? theme.primary : theme.textPrimary} bold={isActive} variant="caption">
                    {modeOpt.label}
                  </TextComponent>
                  <TextComponent color={theme.textTertiary} variant="caption" style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>
                    {modeOpt.desc}
                  </TextComponent>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                      <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Speech Rate Control */}
          <View style={{ borderTopWidth: 1, borderTopColor: theme.borderSecondary, padding: 16 }}>
            <TextComponent color={theme.textPrimary} bold variant="body" style={{ marginBottom: 12 }}>
              {t('voiceNarrationSpeed')}
            </TextComponent>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { rate: 0.75, label: t('slower') },
                { rate: 1.0, label: t('normal') },
                { rate: 1.25, label: t('faster') },
                { rate: 1.4, label: t('fast') },
              ].map((rateOpt) => {
                const isActive = speechRate === rateOpt.rate;
                return (
                  <Pressable
                    key={rateOpt.rate}
                    onPress={() => {
                      setSpeechRate(rateOpt.rate);
                      const formatString = require('../utils/stringUtils').formatString;
                      speak(formatString(t('narrationSpeedChangedTo' as any) || 'Narration speed changed to {0}', rateOpt.label), true, rateOpt.rate);
                    }}
                    style={{
                      flex: 1,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: isActive ? theme.primary : theme.bgPrimary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: isActive ? theme.primary : theme.borderSecondary,
                    }}
                  >
                    <TextComponent color={isActive ? theme.textOnPrimary : theme.textPrimary} bold={isActive} variant="caption">
                      {rateOpt.label}
                    </TextComponent>
                  </Pressable>
                );
              })}
            </View>
          </View>
          
          {/* Show Speak Buttons Option */}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: theme.borderSecondary, borderBottomWidth: 0, paddingHorizontal: 16, paddingVertical: 14 }]}>
            <View style={styles.rowInfo}>
              <TextComponent color={theme.textPrimary} bold variant="body">
                {t('showSpeakerIcons')}
              </TextComponent>
              <TextComponent color={theme.textSecondary} variant="caption">
                {t('showSpeakerIconsDesc')}
              </TextComponent>
            </View>
            <Switch
              value={showSpeakButtons}
              onValueChange={setShowSpeakButtons}
              trackColor={{ false: theme.bgDisabled, true: theme.primary + '80' }}
              thumbColor={showSpeakButtons ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Text Size Section */}
        {renderSectionHeader(t('textSize' as any) || 'Text Size', 'text-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor, padding: 16 }]}>
          <TextComponent color={theme.textSecondary} variant="caption" style={{ marginBottom: 12 }}>
            {t('textSizeDesc')}
          </TextComponent>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { id: 'smallest' as const, label: t('smallest') },
              { id: 'small' as const, label: t('small') },
              { id: 'normal' as const, label: t('normal') },
              { id: 'large' as const, label: t('large') },
              { id: 'largest' as const, label: t('largest') },
            ].map((opt) => {
              const isActive = fontScale === opt.id;
              const previewSize = 
                opt.id === 'smallest' ? 10 :
                opt.id === 'small' ? 12 :
                opt.id === 'normal' ? 14 :
                opt.id === 'large' ? 17 : 21;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setFontScale(opt.id)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderRadius: 10,
                    backgroundColor: isActive ? theme.primary + '15' : theme.bgPrimary,
                    alignItems: 'center',
                    borderWidth: isActive ? 1.5 : 1,
                    borderColor: isActive ? theme.primary : theme.borderSecondary,
                    gap: 2,
                  }}
                >
                  <TextComponent
                    color={isActive ? theme.primary : theme.textSecondary}
                    bold={isActive}
                    size={previewSize}
                  >
                    Aa
                  </TextComponent>
                  <TextComponent 
                    color={isActive ? theme.primary : theme.textPrimary} 
                    bold={isActive} 
                    style={{ fontSize: 9 }}
                  >
                    {opt.label}
                  </TextComponent>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Accessibility Themes Section */}
        {renderSectionHeader(t('accessibilityThemes' as any) || 'Accessibility Themes', 'eye-outline')}
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 }}>
            <TextComponent color={theme.textSecondary} variant="caption">
              Select an optimized theme for color vision deficiencies or high contrast.
            </TextComponent>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themeScrollContainer}
          >
            {COLOR_THEMES.filter(tc => tc.id.endsWith('_accessibility')).map((themeConfig) => {
              const isActive = user?.customTheme === themeConfig.id;
              const config = mode === 'dark' ? themeConfig.dark : themeConfig.light;
              const colors: [string, string] = [
                config.primary || theme.primary,
                config.secondary || config.primary || theme.secondary
              ];

              return (
                <AnimatedPressable
                  key={themeConfig.id}
                  onPress={(e) => handleThemeSelect(themeConfig.id, e)}
                  style={[
                    styles.themeOption,
                    {
                      width: 140,
                      backgroundColor: isActive ? theme.primary + '10' : 'transparent',
                      borderColor: isActive ? theme.primary : theme.borderSecondary,
                      borderWidth: isActive ? 1.5 : 1
                    }
                  ]}
                >
                  <LinearGradient
                    colors={colors}
                    style={styles.themeColorCircle}
                  />
                  <TextComponent
                    style={styles.themeLabel}
                    color={isActive ? theme.primary : theme.textPrimary}
                    bold={isActive}
                    variant="caption"
                    numberOfLines={2}
                  >
                    {themeConfig.name.replace(' (Deuteranopia/Protanopia)', '').replace(' (Tritanopia)', '')}
                  </TextComponent>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: theme.primary }]}>
                      <Ionicons name="checkmark" size={10} color={theme.textOnPrimary} />
                    </View>
                  )}
                </AnimatedPressable>
              );
            })}
          </ScrollView>
        </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  modalLanguageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginBottom: 4,
  },
  themeScrollContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  themeOption: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    position: 'relative',
  },
  themeColorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  themeLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});
