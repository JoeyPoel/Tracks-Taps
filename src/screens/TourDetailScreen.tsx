import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { lightTheme } from '@/src/theme/theme';
import CustomTabBar from '../components/CustomTabBar';

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

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <CustomTabBar tabs={tabs} activeIndex={activeTab} onTabPress={setActiveTab} />

      <Animated.View style={[styles.contentContainer, { transform: [{ translateX: contentAnim }] }]}>
        {tabs.map((tab) => (
          <View key={tab} style={[styles.contentPage, { width }]}>
            <Text style={[styles.text, { color: theme.textPrimary }]}>{tab} content</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flexDirection: 'row', flex: 1 },
  contentPage: { justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 16 },
});