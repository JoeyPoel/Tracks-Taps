import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SectionHeaderProps {
  text: string;
  color: string; // for the underline
}

export default function SectionHeader({ text, color }: SectionHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: theme.textPrimary }]}>{text}</Text>
      <View style={[styles.underline, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  text: {
    fontWeight: '600',
    fontSize: 19,
  },
  underline: {
    height: 2.5,
    marginTop: 2,
  },
});
