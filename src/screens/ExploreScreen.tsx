import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text } from 'react-native';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import TourCard from '../components/exploreScreen/TourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useStore } from '../store/store';

export default function ExploreScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useUserContext();
  const tours = useStore((state) => state.tours);
  const activeTours = useStore((state) => state.activeTours);
  const loading = useStore((state) => state.loadingTours || state.loadingActiveTours);
  const error = useStore((state) => state.errorTours || state.errorActiveTours);
  const fetchAllData = useStore((state) => state.fetchAllData);
  const fetchTourDetails = useStore((state) => state.fetchTourDetails);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchAllData(user.id);
      }
    }, [user?.id, fetchAllData])
  );



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
      {activeTour && (() => {
        const currentTeam = activeTour.teams?.find((t: any) => t.userId === user?.id) || activeTour.teams?.[0];
        const totalStops = activeTour.tour?._count?.stops || activeTour.tour?.stops?.length || 1;
        const currentStop = currentTeam?.currentStop || 1;
        const progress = currentStop / totalStops;

        return (
          <ActiveTourCard
            title={activeTour.tour?.title || ''}
            progress={progress}
            onResume={() => router.push({ pathname: '/active-tour/[id]' as any, params: { id: activeTour.id } })}
          />
        );
      })()}

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
          onPress={async () => {
            // Pre-fetch details before navigating, using current tour as placeholder
            fetchTourDetails(tour.id, tour);
            router.push({ pathname: '/tour/[id]', params: { id: tour.id } });
          }}
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
