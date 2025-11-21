import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import TourCard from '../components/exploreScreen/TourCard';
import { useTheme } from '../context/ThemeContext';
import { tours } from '../data/dummyTours';

export default function ExploreScreen() {
  const { theme } = useTheme();

  const activeTourProps = {
    title: 'Paris Highlights',
    progress: 0.6,
    onResume: () => console.log('Resuming tour'),
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ActiveTourCard {...activeTourProps} />

      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          title={tour.title}
          location={tour.location}
          description={tour.description}
          stops={tour.stops}
          rating={tour.rating}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
