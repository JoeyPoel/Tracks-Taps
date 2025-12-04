import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import TourCard from '../components/exploreScreen/TourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useActiveTours } from '../hooks/useActiveTours';
import { useTours } from '../hooks/useTours';
import { useUser } from '../hooks/useUser';

export default function ExploreScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  // TODO: Replace hardcoded email with actual auth context
  const { user } = useUser(1);
  const { tours, loading: toursLoading, error: toursError } = useTours();
  const { activeTours, loading: activeLoading, error: activeError, refetch: refetchActiveTours } = useActiveTours(user?.id);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        refetchActiveTours();
      }
    }, [user?.id, refetchActiveTours])
  );

  const loading = toursLoading || activeLoading;
  const error = toursError || activeError;

  if (loading) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary, flex: 1, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary, flex: 1, justifyContent: 'center' }]}>
        <Text style={{ color: theme.textPrimary }}>Error loading tours: {error}</Text>
      </ScrollView>
    );
  }

  const activeTour = activeTours.length > 0 ? activeTours[0] : null;

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      {activeTour && (
        <ActiveTourCard
          title={activeTour.tour?.title || ''}
          progress={0.5} // TODO: Calculate actual progress
          onResume={() => router.push({ pathname: '/active-tour/[id]' as any, params: { id: activeTour.id } })}
        />
      )}

      {tours.map((tour) => (
        <TourCard
          key={tour.id}
          title={tour.title}
          author={tour.author?.name || 'Unknown'}
          imageUrl={tour.imageUrl}
          distance={`${tour.distance} km`}
          duration={`${tour.duration} min`}
          stops={tour._count?.stops || 0}
          rating={4.5} // TODO: Implement reviews
          reviewCount={0}
          points={tour.points}
          modes={tour.modes}
          difficulty={tour.difficulty}
          onPress={() => router.push({ pathname: '/tour/[id]', params: { id: tour.id } })}
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
