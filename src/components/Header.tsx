import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import { useTheme } from '../context/ThemeContext';

interface AppHeaderProps {
  title?: string; // Optional title override
  onBackPress?: () => void;
  onRightIconPress?: () => void;
  rightIcon?: React.ReactNode;
  showBackButton?: boolean;
}

export default function AppHeader({
  title: titleProp,
  onBackPress,
  onRightIconPress,
  rightIcon,
  showBackButton = false,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();

  // Determine title based on pathname
  let title = titleProp || 'Tracks&Taps';

  if (!titleProp) {
    if (pathname.includes('/map')) title = 'Map';
    else if (pathname.includes('/profile')) title = 'Profile';
    else if (pathname.includes('/preferences')) title = 'App Preferences';
    else if (pathname.includes('/join')) title = 'Join Tour';
    else if (pathname === '/' || pathname.includes('/explore')) title = 'Explore';
  }

  const isExplore = title === 'Explore';

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, borderBottomColor: theme.borderSecondary }]}>
      {/* Left side - Back button or empty space */}
      <View style={styles.leftContainer}>
        {showBackButton && (
          <Pressable onPress={handleBackPress} style={styles.iconButton}>
            <ArrowLeftIcon size={24} color={theme.textPrimary} />
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
            {rightIcon}
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
