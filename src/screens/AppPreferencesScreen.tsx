import React from 'react';
import { Button, StyleSheet, Switch, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { darkTheme } from '../context/theme';


export default function AppPreferencesScreen() {
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>{t('appPreferences')}</Text>

      {/* Dark Mode Toggle */}
      <View style={styles.preferenceItem}>
        <Text style={[styles.preferenceText, { color: theme.textPrimary }]}>{t('darkMode')}</Text>
        <Switch value={theme === darkTheme} onValueChange={toggleTheme} />
      </View>

      {/* Language Selection */}
      <View style={styles.preferenceItem}>
        <Text style={[styles.preferenceText, { color: theme.textPrimary }]}>{t('language')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="EN" onPress={() => setLanguage('en')} disabled={language === 'en'} />
          <Button title="ES" onPress={() => setLanguage('es')} disabled={language === 'es'} />
          <Button title="NL" onPress={() => setLanguage('nl')} disabled={language === 'nl'} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 12,
  },
  preferenceText: { fontSize: 16 },
});
