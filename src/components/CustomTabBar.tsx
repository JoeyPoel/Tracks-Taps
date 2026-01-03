import { TextComponent } from '@/src/components/common/TextComponent';
import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './common/AnimatedPressable';

interface CustomTabBarProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export default function CustomTabBar({ tabs, activeIndex, onTabPress }: CustomTabBarProps) {
  const { theme } = useTheme();

  const getItemWidth = (index: number, total: number): DimensionValue => {
    if (total <= 3) return `${100 / total}%` as DimensionValue;
    if (total === 4) return '50%';
    if (total === 5) {
      // First 3 items = 33.33%, Last 2 items also 33.33% to keep them closer
      return '33.33%';
    }
    // Default fallback (6+)
    return '33.33%';
  };

  return (
    <View style={styles.tabBarContainer}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.bgSecondary,
            borderColor: theme.borderPrimary, // Optional border for cleaner look
            borderWidth: 1,
          }
        ]}
      >
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          const width = getItemWidth(index, tabs.length);

          return (
            <AnimatedPressable
              key={tab}
              style={[
                styles.tab,
                { width, height: 40 } // Reduced height slightly for elegance
              ]}
              onPress={() => onTabPress(index)}
              interactionScale="subtle"
              haptic="light"
            >
              <TextComponent
                color={isActive ? theme.primary : theme.textSecondary}
                bold={isActive}
                variant="caption"
                style={{
                  opacity: isActive ? 1 : 0.7,
                  borderBottomWidth: isActive ? 2 : 0,
                  borderBottomColor: theme.primary,
                  paddingBottom: 2, // Spacing for underline
                }}
              >
                {tab}
              </TextComponent>
            </AnimatedPressable>
          );
        })}
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
    flexWrap: 'wrap',
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center', // Center content if rows aren't full? Logic handles full width though.
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
});
