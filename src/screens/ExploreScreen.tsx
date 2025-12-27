import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeTour = activeTours.length > 0 ? activeTours[0] : null;

  const CATEGORIES = [
    { id: 'PubGolf', label: 'Pub Golf', icon: '🍺' },
    { id: 'History', label: 'History', icon: '🏛️' },
    { id: 'Culture', label: 'Culture', icon: '🎨' },
    { id: 'Nature', label: 'Nature', icon: '🌳' },
    { id: 'Mystery', label: 'Mystery', icon: '🕵️' },
  ];

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

  const handleCategoryPress = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    setTourFilters({ ...tourFilters, searchQuery: newCategory ? categoryId : '', page: 1 });
    setSearchText(newCategory ? categoryId : '');
  };

  const listHeader = React.useMemo(() => (
    <View>
      {/* Header Title */}
      <Animated.View entering={FadeInDown.duration(600).springify()} style={{ marginTop: 16 }}>
        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>{t('explore') || 'Explore'}</Text>
        <Text style={[styles.screenSubtitle, { color: theme.textSecondary }]}>Find your next adventure</Text>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={[styles.searchContainer, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
        <MagnifyingGlassIcon size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Where to next?"
          placeholderTextColor={theme.textSecondary + '80'} // slightly more transparent
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
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.bgPrimary }]}
          onPress={() => setFilterVisible(true)}
        >
          <AdjustmentsHorizontalIcon size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => handleCategoryPress(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.bgSecondary,
                    borderColor: isSelected ? theme.primary : theme.borderPrimary
                  }
                ]}
              >
                <Text style={{ marginRight: 6 }}>{cat.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFF' : theme.textPrimary }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Active Tour (if any) */}
      {activeTour && (() => {
        const currentTeam = activeTour.teams?.find((t: any) => t.userId === user?.id) || activeTour.teams?.[0];
        const totalStops = activeTour.tour?._count?.stops || activeTour.tour?.stops?.length || 1;
        const currentStop = currentTeam?.currentStop || 1;
        const progress = Math.min(Math.max((currentStop - 1) / totalStops, 0), 1);

        return (
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('currentAdventure') || 'Current Adventure'}</Text>
            <ActiveTourCard
              title={activeTour.tour?.title || ''}
              imageUrl={activeTour.tour?.imageUrl || ''}
              progress={progress}
              onResume={() => router.push({ pathname: '/active-tour/[id]' as any, params: { id: activeTour.id } })}
            />
          </View>
        );
      })()}

      <View style={{ marginTop: 28, marginBottom: 12 }}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 4 }]}>{t('popularTours') || 'Popular Tours'}</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, fontWeight: '500' }}>Curated adventures just for you</Text>
      </View>
    </View>
  ), [activeTour, user?.id, router, searchText, theme, selectedCategory, t]);

  const renderContent = () => {
    if (loading && !tours.length) {
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
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: Tour }) => (
          <View style={{ marginBottom: 16 }}>
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
          </View>
        )}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!loading && tours.length >= (tourFilters.limit || 20)) {
            setTourFilters({ ...tourFilters, page: (tourFilters.page || 1) + 1 });
          }
        }}
        onEndReachedThreshold={0.5}
        // ListFooterComponent={loading ? <ActivityIndicator size="small" color={theme.primary} style={{ marginVertical: 20 }} /> : <View style={{ height: 100 }} />}
        ListFooterComponent={<View style={{ height: 100 }} />} // Spacing for navbar
      />
    );
  };

  return (
    <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={true} includeBottom={false}>
      {renderContent()}
      <ExploreFilterSidebar
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  screenSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
    // Soft Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterButton: {
    padding: 8,
    borderRadius: 50,
    marginLeft: 8,
  },
  categoryContainer: {
    gap: 10,
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  }
});
