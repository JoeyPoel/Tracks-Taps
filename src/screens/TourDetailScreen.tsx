import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent'; // Added import
import AddToSavedTripsModal from '../components/saved-trips/AddToSavedTripsModal';
import TourGallery from '../components/tourdetailScreen/TourGallery';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSavedTrips } from '../hooks/useSavedTrips';
import { useStartTour } from '../hooks/useStartTour';
import { useTourDetails } from '../hooks/useTourDetails';
import { getOptimizedImageUrl } from '../utils/imageUtils';

export default function TourDetailScreen({ tourId }: { tourId: number }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [showSavedTripModal, setShowSavedTripModal] = useState(false);

  const {
    tour,
    loading,
    error,
    averageRating,
    reviewCount,
    formattedReviews
  } = useTourDetails(tourId);

  const { startTour, loadingMode } = useStartTour(tourId, tour?.authorId);
  const { lists, loadLists, checkIsSaved, createList, addTourToList, removeTourFromList } = useSavedTrips();
  const isSaved = checkIsSaved(tourId);

  React.useEffect(() => {
    loadLists();
  }, [tourId, loadLists]);

  // Collect all images from reviews for the gallery
  const allReviewImages = React.useMemo(() => {
    if (!formattedReviews) return [];
    return formattedReviews.reduce((acc: string[], review: any) => {
      if (review.images && review.images.length > 0) {
        // Optimize gallery images
        return [...acc, ...review.images.map((img: string) => getOptimizedImageUrl(img, 600))];
      }
      return acc;
    }, []);
  }, [formattedReviews]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !tour) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.bgPrimary }]}>
        <TextComponent style={{ color: theme.textPrimary }}>Error: {error || 'Tour not found'}</TextComponent>
      </View>
    );
  }

  return (
    <ScreenWrapper key={tourId} style={{ backgroundColor: theme.bgPrimary }} animateEntry={false} includeTop={false} includeBottom={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back Button Overlay */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </BlurView>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: tour.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={['transparent', theme.bgPrimary]}
            style={styles.heroGradient}
          />
          <Animated.View entering={FadeInUp.delay(200)} style={styles.heroContent}>
            <View style={[styles.tagContainer, { backgroundColor: theme.primary }]}>
              <TextComponent style={styles.tagText} variant="caption" bold color="#FFF">{tour.genre}</TextComponent>
            </View>
            <TextComponent style={styles.title} variant="h1" bold color={theme.fixedWhite}>{tour.title}</TextComponent>
            <View style={styles.authorRow}>
              <TextComponent style={{ marginRight: 4 }} color={theme.fixedWhite} variant="body">by</TextComponent>
              <TextComponent style={{ fontWeight: 'bold' }} color={theme.fixedWhite} variant="body" bold>{tour.author?.name || 'Unknown'}</TextComponent>
            </View>
          </Animated.View>

          {/* View on Map FAB */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(tabs)/map', params: { tourId: tour.id } })}
            style={[styles.mapFab, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
          >
            <Ionicons name="map" size={24} color={theme.textPrimary} />
            <TextComponent style={styles.mapFabText} variant="label" bold color={theme.textPrimary}>Map</TextComponent>
          </TouchableOpacity>

          {/* Saved Trip Button */}
          <TouchableOpacity
            onPress={() => setShowSavedTripModal(true)}
            style={[styles.savedTripFab, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={24}
              color={isSaved ? theme.primary : theme.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="time-outline"
            label="Duration"
            value={`${tour.duration} min`}
            theme={theme}
            delay={300}
          />
          <StatCard
            icon="map-outline"
            label="Distance"
            value={`${tour.distance} km`}
            theme={theme}
            delay={400}
          />
          <StatCard
            icon="location-outline"
            label="Stops"
            value={tour.stops?.length || 0}
            theme={theme}
            delay={500}
          />
        </View>

        {/* Description */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <TextComponent style={styles.sectionTitle} variant="h2" bold color={theme.textPrimary}>About this Tour</TextComponent>
          <TextComponent style={styles.description} variant="body" color={theme.textSecondary}>
            {tour.description}
          </TextComponent>
        </Animated.View>

        {/* Rating Placeholder */}
        {/* Gallery Section */}
        <TourGallery images={allReviewImages} />

        {/* Reviews Section (Expandable) */}
        <TourReviews
          reviews={formattedReviews}
          averageRating={averageRating}
          totalReviews={reviewCount}
        />

      </ScrollView>

      {/* Sticky Footer */}
      <Animated.View entering={FadeInDown.delay(800)} style={[styles.footer, { backgroundColor: theme.bgSecondary, borderTopColor: theme.borderPrimary }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <AnimatedButton
            title="Solo"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              startTour(false, false);
            }}
            disabled={loadingMode !== null}
            variant="secondary"
            icon="person"
            iconColor={theme.textPrimary}
            style={{ flex: 1, shadowOpacity: 0, backgroundColor: theme.bgTertiary }}
            textStyle={{ color: theme.textPrimary }}
          />
          <AnimatedButton
            title="With Friends"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              startTour(false, true);
            }}
            disabled={loadingMode !== null}
            variant="primary"
            icon="people"
            gradient={true}
            gradientColors={[theme.secondary, theme.primary]}
            style={{
              flex: 1.5,
              shadowColor: theme.primary,
              shadowOpacity: 0.4,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              borderWidth: 0 // Remove any borders
            }}
          />
        </View>
      </Animated.View>

      <AddToSavedTripsModal
        visible={showSavedTripModal}
        onClose={() => setShowSavedTripModal(false)}
        tourId={tourId}
        lists={lists}
        onCreateList={createList}
        onAddTour={addTourToList}
        onRemoveTour={removeTourFromList}
      />
    </ScreenWrapper>
  );
}

// Mini Component for Stats
const StatCard = ({ icon, label, value, theme, delay }: any) => (
  <Animated.View entering={FadeInUp.delay(delay).springify()} style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}>
    <Ionicons name={icon} size={20} color={theme.primary} style={{ marginBottom: 4 }} />
    <TextComponent style={styles.statValue} variant="h3" bold color={theme.textPrimary}>{value}</TextComponent>
    <TextComponent style={styles.statLabel} variant="label" color={theme.textSecondary}>{label}</TextComponent>
  </Animated.View>
);

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 22,
    overflow: 'hidden',
    // Removed width/height/justify/align/bg from here as they are handled by BlurView or container
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContainer: {
    height: 400,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tagContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginBottom: 12,
  },
  tagText: {
    // handled by TextComponent
    textTransform: 'uppercase',
  },
  title: {
    marginBottom: 8,
    paddingRight: 100, // Safe space for Map FAB
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    // Soft Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statValue: {
    marginBottom: 2,
  },
  statLabel: {
    // handled by TextComponent
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    opacity: 0.8,
  },
  ratingCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  ratingLeft: {
    alignItems: 'flex-start',
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 10,
  },
  mapFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    // Bloom Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  savedTripFab: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 20, // ensure it's above hero image
  },
  mapFabText: {
    // handled by TextComponent
  }
});
