import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { lightTheme, darkTheme } from '@/src/theme/theme';

export default function AppPreferencesScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.header, { color: theme.textPrimary }]}>App Preferences</Text>

      <View style={styles.preferenceItem}>
        <Text style={[styles.preferenceText, { color: theme.textPrimary }]}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
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
