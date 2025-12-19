import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
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
    <View style={[styles.tabBar, { borderBottomColor: theme.borderSecondary }]} onLayout={handleLayout}>
      {tabs.map((tab, index) => (
        <AnimatedPressable
          key={tab}
          style={styles.tab}
          onPress={() => onTabPress(index)}
          interactionScale="subtle"
          haptic="selection"
        >
          <Text
            style={{
              color: activeIndex === index ? theme.primary : theme.textSecondary,
              fontWeight: activeIndex === index ? '700' : '500',
            }}
          >
            {tab}
          </Text>
        </AnimatedPressable>
      ))}
      {tabBarWidth > 0 && (
        <Animated.View
          style={[styles.indicator, { backgroundColor: theme.primary, width: tabWidth, left: slideAnim }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, position: 'relative' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  indicator: { height: 3, position: 'absolute', bottom: 0 },
});
