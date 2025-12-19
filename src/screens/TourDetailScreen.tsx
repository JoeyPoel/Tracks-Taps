import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { UserGroupIcon } from 'react-native-heroicons/outline';
import { AnimatedPressable } from '../components/common/AnimatedPressable';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import AppHeader from '../components/Header';
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
  const router = useRouter();

  const {
    tour,
    loading,
    error,
    averageRating,
    reviewCount,
    formattedReviews
  } = useTourDetails(tourId);

  const { startTour, loadingMode } = useStartTour(tourId);

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
    <ScreenWrapper withScrollView style={{ backgroundColor: theme.bgPrimary, paddingTop: 0 }} animateEntry={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader
        showBackButton
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
      />
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
        buttonText={loadingMode === 'solo' ? "Starting..." : t('startTour')}
        disabled={loadingMode !== null}
        style={{ paddingHorizontal: 24, paddingVertical: 16 }}
      />

      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <AnimatedPressable
          style={{
            backgroundColor: theme.bgSecondary,
            borderWidth: 1,
            borderColor: theme.borderPrimary,
            borderRadius: 12,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: loadingMode !== null ? 0.7 : 1
          }}
          onPress={() => startTour(false, true)}
          disabled={loadingMode !== null}
          interactionScale="medium"
        >
          <UserGroupIcon size={20} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: 'bold' }}>
            {loadingMode === 'lobby' ? "Starting..." : "Play With Friends"}
          </Text>
        </AnimatedPressable>
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
