import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { EmptyState } from '../components/common/EmptyState'; // Added import
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { TextComponent } from '../components/common/TextComponent';
import ExploreFilterSidebar from '../components/exploreScreen/ExploreFilterSidebar';
import { ExploreHeader } from '../components/exploreScreen/ExploreHeader';
import TourCard from '../components/exploreScreen/TourCard';
import TourSkeleton from '../components/exploreScreen/TourSkeleton';
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
  const fetchAllData = useStore((state) => state.fetchAllData);
  const fetchTours = useStore((state) => state.fetchTours);
  const fetchActiveTours = useStore((state) => state.fetchActiveTours);
  const fetchTourDetails = useStore((state) => state.fetchTourDetails);

  const setTourFilters = useStore((state) => state.setTourFilters);
  const tourFilters = useStore((state) => state.tourFilters);
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchText, setSearchText] = useState(tourFilters.searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active tour logic
  const activeTour = activeTours.length > 0 ? activeTours[0] : null;

  useFocusEffect(
    useCallback(() => {
      const currentFilterQuery = tourFilters.searchQuery || '';
      if (currentFilterQuery !== searchText) {
        setSearchText(currentFilterQuery);
      }
      if (user?.id) {
        fetchAllData(user.id);
      }
    }, [user?.id, fetchAllData])
  );

  const onRefresh = useCallback(async () => {
    if (user?.id) {
      setIsRefreshing(true);
      try {
        await Promise.all([fetchTours(), fetchActiveTours(user.id)]);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [user?.id, fetchTours, fetchActiveTours]);

  const handleCategoryPress = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    setTourFilters({ ...tourFilters, searchQuery: newCategory ? categoryId : '', page: 1 });
    setSearchText(newCategory ? categoryId : '');
  };



  // Data Preparation
  const showSkeleton = loading && tours.length === 0;
  const skeletonData = [1, 2, 3, 4];
  const tourData = showSkeleton ? skeletonData : tours;

  // Grid Logic helper
  const isGrid = viewMode === 'grid';
  // If grid, we need to chunk data pairs? SectionList grid support is tricky.
  // We will just render items normally and use flex wrap style if needed?
  // Or since we use a custom list, we'll keep it simple: List for now.
  // Actually, standard SectionList doesn't support numColumns easily. 
  // It's better to format the data into rows if grid is active, OR use `key` prop to force re-render with numColumns (but SectionList doesn't usually support `numColumns` as nicely across sections on all versions).
  // React Native SectionList DOES NOT support `numColumns`.
  // Workaround: Pre-format data into pairs if grid.

  const formatData = (data: any[]) => {
    if (!isGrid) return data;
    const rows = [];
    for (let i = 0; i < data.length; i += 2) {
      rows.push({
        id: data[i].id || `row-${i}`,
        left: data[i],
        right: data[i + 1] || null,
        isRow: true
      });
    }
    return rows;
  };

  const formattedTours = formatData(tourData as any[]);

  const sections = (formattedTours.length > 0) ? [
    {
      title: t('popularTours') || 'Popular Tours',
      data: formattedTours,
    },
  ] : [];

  return (
    <ScreenWrapper
      style={{ backgroundColor: theme.bgPrimary }}
      includeTop={true} // Changed to true
      includeBottom={false}
    >
      <SectionList
        sections={sections}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        ListHeaderComponent={
          <ExploreHeader
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onSearchSubmit={() => {
              const query = (searchText || '').trim();
              if (query !== (tourFilters.searchQuery || '')) {
                setTourFilters({ ...tourFilters, searchQuery: query, page: 1, limit: 20 });
              }
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterPress={() => setFilterVisible(true)}
            selectedCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
            activeTour={activeTour}
            user={user}
            onActiveTourPress={(id) =>
              router.push({ pathname: '/active-tour/[id]' as any, params: { id } })
            }
          />
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.popularToursHeader, { backgroundColor: theme.bgPrimary }]}>
            <TextComponent style={styles.sectionTitle} variant="h2" bold color={theme.textPrimary}>
              {title}
            </TextComponent>
            <View style={{ height: 4 }} />
            <TextComponent style={styles.popularToursSubtitle} variant="label" color={theme.textSecondary}>
              {t('curatedAdventures')}
            </TextComponent>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          formattedTours.length === 0 && styles.emptyScrollContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="map-outline"
                title={t('noToursFound') || 'No Tours Found'}
                message={t('noToursFoundDesc') || 'Explore other areas or try changing your filters.'}
              />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (isGrid && item.isRow) {
            // Render Row
            return (
              <View style={styles.gridRow}>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  {renderTourItem(item.left, true)}
                </View>
                <View style={{ flex: 1, paddingLeft: 6 }}>
                  {item.right ? renderTourItem(item.right, true) : <View style={{ flex: 1 }} />}
                </View>
              </View>
            );
          }
          return renderTourItem(item, false);
        }}
        onEndReached={() => {
          if (!loading && tours.length >= (tourFilters.limit || 20) && !showSkeleton) {
            setTourFilters({ ...tourFilters, page: (tourFilters.page || 1) + 1 });
          }
        }}
        onEndReachedThreshold={0.5}
      />

      <ExploreFilterSidebar
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </ScreenWrapper>
  );

  function renderTourItem(item: any, gridMode: boolean) {
    if (showSkeleton || typeof item === 'number') {
      return (
        <View style={gridMode ? {} : styles.listItemContainer}>
          <TourSkeleton variant={gridMode ? 'grid' : 'hero'} />
        </View>
      );
    }
    const tourItem = item as Tour;

    return (
      <View style={gridMode ? {} : styles.listItemContainer}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <TourCard
            title={tourItem.title}
            author={tourItem.author?.name || t('unknown')}
            imageUrl={tourItem.imageUrl}
            distance={`${tourItem.distance} km`}
            duration={`${tourItem.duration} min`}
            stops={tourItem._count?.stops || 0}
            rating={
              tourItem.reviews && tourItem.reviews.length > 0
                ? tourItem.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                tourItem.reviews.length
                : 0
            }
            reviewCount={tourItem.reviews?.length || 0}
            points={tourItem.points}
            modes={tourItem.modes}
            tourType={tourItem.type}
            genre={(tourItem as any).genre}
            variant={gridMode ? 'grid' : 'hero'}
            onPress={async () => {
              fetchTourDetails(tourItem.id, tourItem);
              router.push({ pathname: '/tour/[id]', params: { id: tourItem.id } });
            }}
          />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: 0,
    letterSpacing: -0.3,
  },
  popularToursHeader: {
    paddingHorizontal: 20,
    paddingTop: 8, // Reduced from 16 to 8
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  popularToursSubtitle: {
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: 120, // Ensure bottom tab doesn't cover content
  },
  listItemContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScrollContent: {
    flexGrow: 1,
  }
});



