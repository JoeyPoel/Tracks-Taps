import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AnimatedButton } from '../components/common/AnimatedButton';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import TourGallery from '../components/tourdetailScreen/TourGallery';
import TourReviews from '../components/tourdetailScreen/TourReviews';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useStartTour } from '../hooks/useStartTour';
import { useTourDetails } from '../hooks/useTourDetails';

export default function TourDetailScreen({ tourId }: { tourId: number }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  const {
    tour,
    loading,
    error,
    averageRating,
    reviewCount,
    formattedReviews
  } = useTourDetails(tourId);

  const { startTour, loadingMode } = useStartTour(tourId, tour?.authorId);

  // Collect all images from reviews for the gallery
  const allReviewImages = React.useMemo(() => {
    if (!formattedReviews) return [];
    return formattedReviews.reduce((acc: string[], review: any) => {
      if (review.images && review.images.length > 0) {
        return [...acc, ...review.images];
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
        <Text style={{ color: theme.textPrimary }}>Error: {error || 'Tour not found'}</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper key={tourId} style={{ backgroundColor: theme.bgPrimary }} animateEntry={false} includeTop={false} includeBottom={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back Button Overlay */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: theme.bgPrimary + '80' }]}
      >
        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
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
              <Text style={styles.tagText}>{tour.genre}</Text>
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{tour.title}</Text>
            <View style={styles.authorRow}>
              <Text style={{ color: theme.textSecondary, marginRight: 4 }}>by</Text>
              <Text style={{ color: theme.textPrimary, fontWeight: 'bold' }}>{tour.author?.name || 'Unknown'}</Text>
            </View>
          </Animated.View>

          {/* View on Map FAB */}
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(tabs)/map', params: { tourId: tour.id } })}
            style={[styles.mapFab, { backgroundColor: theme.bgPrimary, shadowColor: theme.primary }]}
          >
            <Ionicons name="map" size={24} color={theme.primary} />
            <Text style={[styles.mapFabText, { color: theme.textPrimary }]}>Map</Text>
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
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>About this Tour</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {tour.description}
          </Text>
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
            style={{ flex: 1, shadowOpacity: 0 }}
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
            style={{ flex: 1.5, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
          />
        </View>
      </Animated.View>

    </ScreenWrapper>
  );
}

// Mini Component for Stats
const StatCard = ({ icon, label, value, theme, delay }: any) => (
  <Animated.View entering={FadeInUp.delay(delay).springify()} style={[styles.statCard, { backgroundColor: theme.bgSecondary }]}>
    <Ionicons name={icon} size={20} color={theme.primary} style={{ marginBottom: 4 }} />
    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: -1,
    lineHeight: 38,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
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
  mapFabText: {
    fontWeight: 'bold',
    fontSize: 14,
  }
});
