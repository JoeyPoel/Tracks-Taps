import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { lightTheme } from '@/src/theme/theme';
import CustomTabBar from '../components/CustomTabBar';
import TourDetailHeader from '../components/tourdetailScreen/TourDetailHeader';

const { width } = Dimensions.get('window');
const tabs = ['Overview', 'Itinerary', 'Reviews'];

export default function TourDetailScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const contentAnim = useRef(new Animated.Value(0)).current;
  const theme = lightTheme;

  useEffect(() => {
    Animated.spring(contentAnim, {
      toValue: -activeTab * width,
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const headerProps = {
    title: 'Amazing Tour',
    location: 'Paris, France',
    author: 'John Doe',
    rating: 4.5,
    reviews: 128,
    description: 'Experience the beauty and culture of Paris on this guided tour.',
    onStartTour: () => console.log('Tour started!'),
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <TourDetailHeader {...headerProps} />

        <CustomTabBar tabs={tabs} activeIndex={activeTab} onTabPress={setActiveTab} />

        <Animated.View
          style={[styles.contentContainer, { transform: [{ translateX: contentAnim }] }]}
        >
          {tabs.map((tab) => (
            <View key={tab} style={[styles.contentPage, { width }]}>
              <Text style={[styles.text, { color: theme.textPrimary }]}>{tab} content</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexDirection: 'row', flex: 1 },
  contentPage: { justifyContent: 'center', alignItems: 'center', height: 300 },
  text: { fontSize: 16 },
});
