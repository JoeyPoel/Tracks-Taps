import React, { useEffect, useRef, useState } from 'react';
import { Animated, LayoutChangeEvent, ScrollView, StyleSheet, View } from 'react-native';
import CustomTabBar from '../components/CustomTabBar';
import SectionHeader from '../components/SectionHeader';
import TourDetailHeader from '../components/tourdetailScreen/TourDetailHeader';
import { useTheme } from '../context/ThemeContext';
import { tours } from '../data/dummyTours';
import { reviews } from '../data/dummyReviews';

const tabs = ['Overview', 'Itinerary', 'Reviews'];

export default function TourDetailScreen() {
  const { theme } = useTheme();
  // TODO NEEDS TO BE REPLACED WITH BACKEND LOGIC
  const tour = tours[1]; // Example: Paris Art Tour

  const tourReviews = reviews.filter(r => r.tourId === tour.id);
  const reviewCount = tourReviews.length;
  const averageRating =
    reviewCount > 0
      ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  const [activeTab, setActiveTab] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (containerWidth > 0) {
      Animated.spring(contentAnim, {
        toValue: -activeTab * containerWidth,
        useNativeDriver: false,
      }).start();
    }
  }, [activeTab, containerWidth]);

  const handleLayout = (e: LayoutChangeEvent) =>
    setContainerWidth(e.nativeEvent.layout.width);

  const headerProps = {
    title: tour.title,
    location: tour.location,
    author: tour.author,
    rating: averageRating,
    reviews: reviewCount,
    description: tour.description,
    onStartTour: () => console.log('Tour started!'),
    theme,
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
        return (
          <>
            <SectionHeader text="User Reviews" color={theme.secondary} />
          </>
        );
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
