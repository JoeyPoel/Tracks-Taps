import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StartTourButton from '../components/TourButton';
import TourAbout from '../components/tourdetailScreen/TourAbout';
import TourGameModes from '../components/tourdetailScreen/TourGameModes';
import TourHeader from '../components/tourdetailScreen/TourHeader';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import TourStats from '../components/tourdetailScreen/TourStats';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useStore } from '../store/store';

export default function TourDetailScreen({ tourId }: { tourId: number }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const tour = useStore((state) => state.tourDetails[tourId]);
  const loading = useStore((state) => state.loadingTours && !state.tourDetails[tourId]);
  const error = useStore((state) => state.errorTours);
  const fetchTourDetails = useStore((state) => state.fetchTourDetails);

  React.useEffect(() => {
    if (tourId && !tour) {
      fetchTourDetails(tourId);
    }
  }, [tourId, tour, fetchTourDetails]);

  const { user } = useUserContext();
  const router = useRouter();

  const handleStartTour = async (force = false) => {
    if (!user) return;

    try {
      const response = await fetch('/api/active-tours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          tourId: tourId,
          force: force,
        }),
      });

      if (response.status === 409) {
        const { activeTour } = await response.json();

        if (Platform.OS === 'web') {
          const shouldReplace = window.confirm(
            `You have an active tour: "${activeTour.tour.title}". Starting a new one will cause you to lose progress. Do you want to proceed?`
          );
          if (shouldReplace) {
            handleStartTour(true);
          }
        } else {
          Alert.alert(
            'Active Tour Exists',
            `You have an active tour: "${activeTour.tour.title}". Starting a new one will cause you to lose progress. Do you want to proceed?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Start New Tour',
                style: 'destructive',
                onPress: () => handleStartTour(true),
              },
            ]
          );
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to start tour');
      }

      const newActiveTour = await response.json();
      router.push(`/active-tour/${newActiveTour.id}`);

    } catch (error) {
      console.error('Error starting tour:', error);
      if (Platform.OS === 'web') {
        alert('Failed to start tour. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to start tour. Please try again.');
      }
    }
  };

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
      ? tour.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
      : 0;

  // Convert reviews to component format
  const reviewsData = tour.reviews.map((review: any) => ({
    id: review.id.toString(),
    userId: 'unknown', // TODO: Add authorId to review in schema/service
    userName: review.author?.name || 'Unknown',
    userAvatar: 'https://i.pravatar.cc/150?img=1', // Placeholder
    rating: review.rating,
    date: new Date(review.createdAt).toLocaleDateString(),
    comment: review.content,
    images: review.photos,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TourHeader
          title={tour.title}
          author={tour.author?.name || 'Unknown'}
          imageUrl={tour.imageUrl}
        />

        <TourStats
          distance={`${tour.distance} km`}
          duration={`${tour.duration} min`}
          stops={tour._count?.stops || 0}
          points={tour.points}
        />

        <TourAbout
          description={tour.description}
        />

        <StartTourButton onPress={() => handleStartTour(false)} buttonText={t('startTour')} />
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.bgSecondary,
              borderWidth: 1,
              borderColor: theme.borderPrimary,
              borderRadius: 12,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => router.push({ pathname: '/team-setup', params: { tourId } })}
          >
            <Ionicons name="people-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.primary, fontSize: 16, fontWeight: 'bold' }}>Team Battle Mode</Text>
          </TouchableOpacity>
        </View>

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
