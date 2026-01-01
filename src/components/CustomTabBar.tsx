import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './common/AnimatedPressable';

interface CustomTabBarProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export default function CustomTabBar({ tabs, activeIndex, onTabPress }: CustomTabBarProps) {
  const { theme } = useTheme();
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (tabBarWidth > 0) {
      Animated.spring(slideAnim, {
        toValue: activeIndex * (tabBarWidth / tabs.length),
        useNativeDriver: false,
      }).start();
    }
  }, [activeIndex, tabBarWidth]);

  const handleLayout = (e: LayoutChangeEvent) => setTabBarWidth(e.nativeEvent.layout.width);

  const tabWidth = tabBarWidth / tabs.length;

  return (
    <View style={styles.tabBarContainer}>
      <View style={[styles.tabBar, { backgroundColor: theme.bgSecondary }]}>
        {/* Animated Pill Background */}
        {tabBarWidth > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: theme.primary,
                width: tabWidth - 8, // Subtract margin
                transform: [{ translateX: slideAnim }]
              }
            ]}
          />
        )}

        {tabs.map((tab, index) => (
          <AnimatedPressable
            key={tab}
            style={styles.tab}
            onPress={() => onTabPress(index)}
            interactionScale="subtle"
            haptic="light"
          >
            <TextComponent
              style={{
                zIndex: 1, // Ensure text is above indicator
              }}
              color={activeIndex === index ? '#FFF' : theme.textSecondary}
              bold={activeIndex === index}
              variant="caption"
            >
              {tab}
            </TextComponent>
          </AnimatedPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 4,
    position: 'relative',
    height: 48, // Fixed height for consistency
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4, // Initial offset matching padding
    bottom: 4,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
