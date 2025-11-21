import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { darkTheme } from '@/src/theme/theme';
import { useTheme } from '../theme/ThemeContext';

export default function AppPreferencesScreen() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>App Preferences</Text>

      <View style={styles.preferenceItem}>
        <Text style={[styles.preferenceText, { color: theme.textPrimary }]}>Dark Mode</Text>
        <Switch value={theme === darkTheme} onValueChange={toggleTheme} />
      </View>

      {/* Add more app preferences here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  preferenceText: { fontSize: 16 },
});
