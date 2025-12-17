import { useTheme } from '@/src/context/ThemeContext';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRightIcon } from 'react-native-heroicons/outline';

interface SettingsItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export default function SettingsItem({ icon, title, subtitle, onPress }: SettingsItemProps) {
  const { theme, mode } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
      onPress={onPress}
    >
      <View style={[styles.iconWrapper, { backgroundColor: mode === 'dark' ? theme.bgTertiary : theme.bgPrimary }]}>
        {icon}
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
      </View>
      <ChevronRightIcon size={20} color={theme.iconMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 12, marginTop: 2 },
});
