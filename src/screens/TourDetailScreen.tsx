import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StartTourButton from '../components/TourButton';
import TourAbout from '../components/tourdetailScreen/TourAbout';
import TourGameModes from '../components/tourdetailScreen/TourGameModes';
import TourHeader from '../components/tourdetailScreen/TourHeader';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import TourStats from '../components/tourdetailScreen/TourStats';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useStartTour } from '../hooks/useStartTour';
import { useTourDetails } from '../hooks/useTourDetails';

export default function TourDetailScreen({ tourId }: { tourId: number }) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const {
    tour,
    loading,
    error,
    averageRating,
    reviewCount,
    formattedReviews
  } = useTourDetails(tourId);

  const { startTour, isStarting } = useStartTour(tourId);

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
          stops={tour.stops?.length || tour._count?.stops || 0}
          points={tour.points}
        />

        <TourAbout
          description={tour.description}
        />

        <StartTourButton
          onPress={() => startTour(false, false)}
          buttonText={isStarting ? "Starting..." : t('startTour')}
        />

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
            onPress={() => startTour(false, true)}
            disabled={isStarting}
          >
            <Ionicons name="people-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 'bold' }}>
              {isStarting ? "Starting..." : "Play With Friends"}
            </Text>
          </TouchableOpacity>
        </View>

        <TourGameModes
          modes={tour.modes}
          challengesCount={tour.challenges.length || 0}
          stopsCount={tour.stops.length || 0}
        />

        <TourReviews
          reviews={formattedReviews}
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
