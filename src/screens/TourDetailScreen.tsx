import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import StartTourButton from '../components/TourButton';
import TourAbout from '../components/tourdetailScreen/TourAbout';
import TourGameModes from '../components/tourdetailScreen/TourGameModes';
import TourHeader from '../components/tourdetailScreen/TourHeader';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import TourStats from '../components/tourdetailScreen/TourStats';
import { useTheme } from '../context/ThemeContext';
import { reviews } from '../data/dummyReviews';
import { tours } from '../data/dummyTours';
import { useLanguage } from '../context/LanguageContext';

export default function TourDetailScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const tour = tours[1]; // Example: Maastricht Culinary Trail
  const tourReviews = reviews.filter(r => r.tourId === tour.id);
  const reviewCount = tourReviews.length;
  const averageRating =
    reviewCount > 0
      ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // Convert reviews to component format
  const reviewsData = tourReviews.map(review => ({
    id: review.id.toString(),
    userId: review.userId,
    userName: review.userName,
    userAvatar: review.userAvatar,
    rating: review.rating,
    date: review.date,
    comment: review.comment,
    images: review.images,
  }));

  const handleStartTour = () => {
    console.log('Tour started!');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TourHeader
          title={tour.title}
          author={tour.author}
          imageUrl={tour.imageUrl}
        />

        <TourStats
          distance={tour.distance}
          duration={tour.duration}
          stops={tour.stops}
          points={tour.points}
        />

        <StartTourButton onPress={handleStartTour} buttonText={t('startTour')}/>

        <TourAbout
          description={tour.description}
        />

        <TourGameModes
          modes={tour.modes}
          challengesCount={tour.challengesCount}
          stopsCount={tour.stops}
        />

        <TourReviews
          reviews={reviewsData}
          averageRating={averageRating}
          totalReviews={reviewCount}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
