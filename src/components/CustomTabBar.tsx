import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import { lightTheme } from '@/src/theme/theme';

const { width } = Dimensions.get('window');

interface CustomTabBarProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export default function CustomTabBar({ tabs, activeIndex, onTabPress }: CustomTabBarProps) {
  const theme = lightTheme;
  const slideAnim = useRef(new Animated.Value(activeIndex * (width / tabs.length))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * (width / tabs.length),
      useNativeDriver: false,
    }).start();
  }, [activeIndex]);

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab, index) => (
        <TouchableOpacity key={tab} style={styles.tab} onPress={() => onTabPress(index)}>
          <Text style={{
            color: activeIndex === index ? theme.primary : theme.textSecondary,
            fontWeight: activeIndex === index ? '700' : '500',
          }}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
      <Animated.View
        style={[
          styles.indicator,
          { backgroundColor: theme.primary, width: width / tabs.length, left: slideAnim },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'relative',
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  indicator: { height: 3, position: 'absolute', bottom: 0 },
});
