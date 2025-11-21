import React, { useRef, useState, useEffect } from 'react';
import { View, Animated, StyleSheet, ScrollView, LayoutChangeEvent } from 'react-native';
import { lightTheme } from '@/src/theme/theme';
import CustomTabBar from '../components/CustomTabBar';
import TourDetailHeader from '../components/tourdetailScreen/TourDetailHeader';
import SectionHeader from '../components/SectionHeader';

const tabs = ['Overview', 'Itinerary', 'Reviews'];

export default function TourDetailScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const contentAnim = useRef(new Animated.Value(0)).current;
  const theme = lightTheme;

  useEffect(() => {
    if (containerWidth > 0) {
      Animated.spring(contentAnim, {
        toValue: -activeTab * containerWidth,
        useNativeDriver: false,
      }).start();
    }
  }, [activeTab, containerWidth]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const headerProps = {
    title: 'Amazing Tour',
    location: 'Paris, France',
    author: 'John Doe',
    rating: 4.5,
    reviews: 128,
    description: 'Experience the beauty and culture of Paris on this guided tour.',
    onStartTour: () => console.log('Tour started!'),
  };

  const renderTabContent = (tab: string) => {
    switch (tab) {
      case 'Overview':
        return (
          <>
            <SectionHeader text="Tour Map" color={theme.secondary} />
            <SectionHeader text="Top Players this week" color={theme.secondary} />
            <SectionHeader text="Reviews" color={theme.secondary} />
          </>
        );
      case 'Itinerary':
        return (
          <>
            <SectionHeader text="Tour Wide Challenges" color={theme.secondary} />
            <SectionHeader text="Tour Stops" color={theme.secondary} />
          </>
        );
      case 'Reviews':
        return <SectionHeader text="User Reviews" color={theme.secondary} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <TourDetailHeader {...headerProps} />

        <CustomTabBar tabs={tabs} activeIndex={activeTab} onTabPress={setActiveTab} />

        <Animated.View
          onLayout={handleLayout}
          style={[styles.contentContainer, { transform: [{ translateX: contentAnim }] }]}
        >
          {containerWidth > 0 &&
            tabs.map((tab) => (
              <View key={tab} style={[styles.contentPage, { width: containerWidth }]}>
                {renderTabContent(tab)}
              </View>
            ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  contentContainer: { flexDirection: 'row', flex: 1 },
  contentPage: { paddingVertical: 16 },
});
