import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

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
        <TouchableOpacity key={tab} style={styles.tab} onPress={() => onTabPress(index)}>
          <Text
            style={{
              color: activeIndex === index ? theme.primary : theme.textSecondary,
              fontWeight: activeIndex === index ? '700' : '500',
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
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
