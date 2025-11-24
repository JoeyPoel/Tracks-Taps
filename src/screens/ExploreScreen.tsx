import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import TourCard from '../components/exploreScreen/TourCard';
import { useTheme } from '../context/ThemeContext';
import { reviews } from '../data/dummyReviews';
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

      {tours.map((tour) => {
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
            author={tour.author}
            imageUrl={tour.imageUrl}
            distance={tour.distance}
            duration={tour.duration}
            stops={tour.stops}
            rating={rating}
            reviewCount={reviewCount}
            points={tour.points}
            modes={tour.modes}
            difficulty={tour.difficulty}
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
