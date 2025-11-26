import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface AppHeaderProps {
  onBackPress?: () => void;
  onRightIconPress?: () => void;
  rightIcon?: string;
  showBackButton?: boolean;
}

export default function AppHeader({
  onBackPress,
  onRightIconPress,
  rightIcon,
  showBackButton = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();

  // Determine title based on pathname
  let title = 'Tracks&Taps';
  if (pathname.includes('/map')) title = 'Map';
  else if (pathname.includes('/profile')) title = 'Profile';
  else if (pathname.includes('/preferences')) title = 'App Preferences';
  else if (pathname === '/' || pathname.includes('/explore')) title = 'Explore';

  const isExplore = title === 'Explore';

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, borderBottomColor: theme.borderSecondary }]}>
      {/* Left side - Back button or empty space */}
      <View style={[styles.leftContainer, !showBackButton && styles.noBackButton]}>
        {showBackButton && (
          <Pressable onPress={handleBackPress} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
        )}
      </View>

      {/* Center - Title */}
      <View style={styles.centerContainer}>
        {isExplore ? (
          <Text style={styles.exploreText}>
            <Text style={{ color: theme.primary }}>Tracks</Text>
            <Text style={{ color: theme.secondary }}>&Taps</Text>
          </Text>
        ) : (
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        )}
      </View>

      {/* Right side - Icon button or empty space */}
      <View style={styles.rightContainer}>
        {rightIcon && onRightIconPress && (
          <Pressable onPress={onRightIconPress} style={styles.iconButton}>
            <Ionicons name={rightIcon as any} size={24} color={theme.textPrimary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftContainer: {
    width: 40,
    justifyContent: 'center',
  },
  noBackButton: {
    width: 0,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  exploreText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
