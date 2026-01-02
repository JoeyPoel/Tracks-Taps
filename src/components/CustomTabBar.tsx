import { TextComponent } from '@/src/components/common/TextComponent';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedPressable } from './common/AnimatedPressable';

interface CustomTabBarProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export default function CustomTabBar({ tabs, activeIndex, onTabPress }: CustomTabBarProps) {
  const { theme } = useTheme();
  const [containerLayout, setContainerLayout] = useState({ width: 0, height: 0 });

  // Animation values for X and Y position
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Layout constants
  const MAX_ITEMS_PER_ROW = 2; // When wrapping, how many cols?
  // If tabs > 3, we switch to grid mode. 
  // 4 items -> 2x2. 5 items -> 3 then 2? Or just wrap. 
  // Let's go with a simple "If > 3, use 2 columns grid".
  // Actually, for 4 items, 2x2 is nice. For 5, maybe 3-2. 
  // Let's try a dynamic approach: 
  // If count <= 3: 1 row, count columns.
  // If count == 4: 2 rows, 2 columns.
  // If count >= 5: 2 rows, ceil(count/2) columns? 
  // Let's stick to the plan: if > 3, we force grid.

  const isGrid = tabs.length > 3;
  const numRows = isGrid ? Math.ceil(tabs.length / 2) : 1;
  const numCols = isGrid ? 2 : tabs.length;

  // Determine row and col for current active index
  const activeRow = isGrid ? Math.floor(activeIndex / 2) : 0;
  const activeCol = isGrid ? activeIndex % 2 : activeIndex;

  useEffect(() => {
    if (containerLayout.width > 0) {
      const itemWidth = containerLayout.width / numCols;
      const itemHeight = 44; // Fixed height per row currently

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: activeCol * itemWidth,
          useNativeDriver: false,
          duration: 250,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(translateY, {
          toValue: activeRow * itemHeight,
          useNativeDriver: false,
          duration: 250,
          easing: Easing.out(Easing.cubic),
        })
      ]).start();
    }
  }, [activeIndex, containerLayout.width, isGrid, numCols, activeRow, activeCol]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerLayout({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    });
  };

  // Calculate generic item dimensions
  const itemWidth = containerLayout.width > 0 ? containerLayout.width / numCols : 0;
  const itemHeight = 44;
  const totalHeight = itemHeight * numRows;

  return (
    <View style={styles.tabBarContainer}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.bgSecondary,
            height: totalHeight + 8, // + padding
            flexWrap: 'wrap',
          }
        ]}
        onLayout={handleLayout}
      >
        {/* Animated Pill Background */}
        {containerLayout.width > 0 && (
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: theme.primary,
                width: itemWidth - 8, // Subtract margin
                height: itemHeight - 4, // Subtract margin
                transform: [
                  { translateX: translateX },
                  { translateY: translateY }
                ]
              }
            ]}
          />
        )}

        {tabs.map((tab, index) => {
          // For grid styling
          const row = isGrid ? Math.floor(index / numCols) : 0;
          // const col = isGrid ? index % numCols : index;

          return (
            <AnimatedPressable
              key={tab}
              style={[
                styles.tab,
                {
                  width: `${100 / numCols}%`,
                  height: itemHeight
                }
              ]}
              onPress={() => onTabPress(index)}
              interactionScale="subtle"
              haptic="light"
            >
              <TextComponent
                style={{
                  zIndex: 1,
                }}
                color={activeIndex === index ? theme.textPrimary : theme.textSecondary}
                bold={activeIndex === index}
                variant="caption"
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
    borderRadius: 16, // Slightly tighter radius for grid look
    padding: 4,
    position: 'relative',
    overflow: 'hidden', // Contain indicator
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    zIndex: 2,
  },
  indicator: {
    position: 'absolute',
    top: 4, // Initial offset matching padding
    left: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
