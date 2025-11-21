import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

export default function Header() {
  const route = useRoute();
  const { theme } = useTheme();
  const title = route.name;

  const isExplore = title === 'Explore';

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, borderBottomColor: theme.borderSecondary }]}>
      {isExplore ? (
        <Text style={styles.exploreText}>
          <Text style={{ color: theme.primary }}>Tracks</Text>
          <Text style={{ color: theme.secondary }}>&Traps</Text>
        </Text>
      ) : (
        <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  exploreText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: '700',
  },
});
