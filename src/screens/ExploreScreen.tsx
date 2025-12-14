import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import ExploreFilterSidebar from '../components/exploreScreen/ExploreFilterSidebar';
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

  const setTourFilters = useStore((state) => state.setTourFilters);
  const tourFilters = useStore((state) => state.tourFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState(tourFilters.searchQuery || '');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== tourFilters.searchQuery) {
        setTourFilters({ ...tourFilters, searchQuery: searchText });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      // Sync local text if filters change externally (e.g. clear filters)
      if (tourFilters.searchQuery !== undefined && tourFilters.searchQuery !== searchText) {
        setSearchText(tourFilters.searchQuery);
      }

      if (user?.id) {
        fetchAllData(user.id);
      }
    }, [user?.id, fetchAllData, tourFilters.searchQuery])
  );

  if (loading && !tours.length) { // Only show full loader if no data
    return (
      <View style={[styles.centered, { backgroundColor: theme.bgPrimary }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error && !tours.length) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bgPrimary }]}>
        <Text style={{ color: theme.textPrimary }}>Error loading tours: {error}</Text>
      </View>
    );
  }

  const activeTour = activeTours.length > 0 ? activeTours[0] : null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <View style={[styles.header, { backgroundColor: theme.bgPrimary }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
          <MagnifyingGlassIcon size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search tours..."
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={[styles.filterButton, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
          <AdjustmentsHorizontalIcon size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTour && (() => {
          const currentTeam = activeTour.teams?.find((t: any) => t.userId === user?.id) || activeTour.teams?.[0];
          const totalStops = activeTour.tour?._count?.stops || activeTour.tour?.stops?.length || 1;
          const currentStop = currentTeam?.currentStop || 1;
          const progress = currentStop / totalStops;

          return (
            <ActiveTourCard
              title={activeTour.tour?.title || ''}
              imageUrl={activeTour.tour?.imageUrl || ''}
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
            rating={tour.reviews && tour.reviews.length > 0
              ? tour.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tour.reviews.length
              : 0}
            reviewCount={tour.reviews?.length || 0}
            points={tour.points}
            modes={tour.modes}
            difficulty={tour.difficulty}
            onPress={async () => {
              fetchTourDetails(tour.id, tour);
              router.push({ pathname: '/tour/[id]', params: { id: tour.id } });
            }}
          />
        ))}
      </ScrollView>

      <ExploreFilterSidebar
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16, // Reduced padding
    paddingBottom: 10,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0, // remove default padding
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 24,
  }
});
