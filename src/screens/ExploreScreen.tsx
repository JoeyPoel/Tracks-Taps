import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import ExploreFilterSidebar from '../components/exploreScreen/ExploreFilterSidebar';
import TourCard from '../components/exploreScreen/TourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { useStore } from '../store/store';
import { Tour } from '../types/models';

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

  const activeTour = activeTours.length > 0 ? activeTours[0] : null;

  const listHeader = React.useMemo(() => (
    <>
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
    </>
  ), [activeTour, user?.id, router]);


  useFocusEffect(
    useCallback(() => {
      // Sync local text if filters change externally (e.g. clear filters)
      const currentFilterQuery = tourFilters.searchQuery || '';
      if (currentFilterQuery !== searchText) {
        setSearchText(currentFilterQuery);
      }

      if (user?.id) {
        fetchAllData(user.id);
      }
    }, [user?.id, fetchAllData])
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



  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <View style={[styles.header, { backgroundColor: theme.bgPrimary }]}>
        <View style={[styles.searchContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
          <TouchableOpacity onPress={() => {
            const query = (searchText || '').trim();
            if (query !== (tourFilters.searchQuery || '')) {
              setTourFilters({ ...tourFilters, searchQuery: query, page: 1, limit: 20 });
            }
          }}>
            <MagnifyingGlassIcon size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
          </TouchableOpacity>
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search tours..."
            placeholderTextColor={theme.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            onSubmitEditing={() => {
              const query = (searchText || '').trim();
              if (query !== (tourFilters.searchQuery || '')) {
                setTourFilters({ ...tourFilters, searchQuery: query, page: 1, limit: 20 });
              }
            }}
          />
        </View>
        <TouchableOpacity onPress={() => setFilterVisible(true)} style={[styles.filterButton, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
          <AdjustmentsHorizontalIcon size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: Tour }) => (
          <TourCard
            title={item.title}
            author={item.author?.name || 'Unknown'}
            imageUrl={item.imageUrl}
            distance={`${item.distance} km`}
            duration={`${item.duration} min`}
            stops={item._count?.stops || 0}
            rating={item.reviews && item.reviews.length > 0
              ? item.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / item.reviews.length
              : 0}
            reviewCount={item.reviews?.length || 0}
            points={item.points}
            modes={item.modes}
            difficulty={item.difficulty as any}
            genre={(item as any).genre}
            onPress={async () => {
              fetchTourDetails(item.id, item);
              router.push({ pathname: '/tour/[id]', params: { id: item.id } });
            }}
          />
        )}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.scrollContent}
        onEndReached={() => {
          if (!loading && tours.length >= (tourFilters.limit || 20)) {
            setTourFilters({ ...tourFilters, page: (tourFilters.page || 1) + 1 });
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} /> : null}
      />

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
