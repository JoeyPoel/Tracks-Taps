import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import TourCard from '../components/exploreScreen/TourCard';
import { useTheme } from '../context/ThemeContext';
import { tours} from '../data/dummyTours';
import { reviews } from '../data/dummyReviews';

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
    
      {tours.map((tour) => { // TODO REPLACE WITH LOGIC FROM BACKEND
        const tourReviews = reviews.filter(r => r.tourId === tour.id);
        const reviewCount = tourReviews.length;

        const rating =
          reviewCount > 0
            ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

        return (
          <TourCard
            key={tour.id}
            title={tour.title}
            location={tour.location}
            description={tour.description}
            stops={tour.stops}
            rating={rating}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
