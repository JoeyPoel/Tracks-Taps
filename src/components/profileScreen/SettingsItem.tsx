import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '@/src/theme/theme';

interface SettingsItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function SettingsItem({ icon, title, subtitle, onPress }: SettingsItemProps) {
  const theme = lightTheme;

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
      <View style={styles.iconWrapper}>{icon}</View>
      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.iconMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
});
