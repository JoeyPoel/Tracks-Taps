import { useRoute } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import StartTourButton from '../components/TourButton';
import TourAbout from '../components/tourdetailScreen/TourAbout';
import TourGameModes from '../components/tourdetailScreen/TourGameModes';
import TourHeader from '../components/tourdetailScreen/TourHeader';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import TourStats from '../components/tourdetailScreen/TourStats';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTourDetails } from '../hooks/useTourDetails';

export default function TourDetailScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const route = useRoute();
  const { id } = route.params as { id: number };
  const { tour, loading, error } = useTourDetails(id);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !tour) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textPrimary }}>Error loading tour: {error || 'Tour not found'}</Text>
      </View>
    );
  }

  const reviewCount = tour.reviews.length;
  const averageRating =
    reviewCount > 0
      ? tour.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // Convert reviews to component format
  const reviewsData = tour.reviews.map(review => ({
    id: review.id.toString(),
    userId: 'unknown', // TODO: Add authorId to review in schema/service
    userName: review.author.name,
    userAvatar: 'https://i.pravatar.cc/150?img=1', // Placeholder
    rating: review.rating,
    date: new Date(review.createdAt).toLocaleDateString(),
    comment: review.content,
    images: review.photos,
  }));

  const handleStartTour = () => {
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TourHeader
          title={tour.title}
          author={tour.author.name}
          imageUrl={tour.imageUrl}
        />

        <TourStats
          distance={`${tour.distance} km`}
          duration={`${tour.duration} min`}
          stops={tour._count?.stops || 0}
          points={tour.points}
        />

        <StartTourButton onPress={handleStartTour} buttonText={t('startTour')} />

        <TourAbout
          description={tour.description}
        />

        <TourGameModes
          modes={tour.modes}
          challengesCount={tour.challenges.length || 0}
          stopsCount={tour.stops.length || 0}
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
