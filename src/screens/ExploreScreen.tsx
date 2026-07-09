import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import client from '@/src/api/apiClient';
import { AppSettings } from '../types/models';
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
import { FadeInItem } from '../components/common/FadeInList';
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tracking first load to prevent flash of empty state
  const [hasInitialized, setHasInitialized] = useState(false);

  // Active tour logic
  const activeTour = activeTours.length > 0 ? activeTours[0] : null;

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        // Reset page back to 1 on mount/focus if it hydrated with a different page
        let currentFilters = useStore.getState().tourFilters;
        if (currentFilters.page && currentFilters.page !== 1) {
          currentFilters = { ...currentFilters, page: 1 };
          useStore.setState({ tourFilters: currentFilters });
        }

        const currentFilterQuery = currentFilters.searchQuery || '';
        if (currentFilterQuery !== searchText) {
          setSearchText(currentFilterQuery);
        }
        if (user?.id) {
          await fetchAllData(user.id);
        } else {
          // Guest mode: fetch tours only
          await fetchTours();
        }
        
        // Fetch global settings
        try {
          const response = await client.get('/app-settings');
          setAppSettings(response.data);
        } catch (error) {
          console.error('Failed to fetch app settings:', error);
        }

        setHasInitialized(true);
      };
      init();
    }, [user?.id, fetchAllData, fetchTours])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Reset page back to 1 on pull-to-refresh
      const currentFilters = useStore.getState().tourFilters;
      if (currentFilters.page && currentFilters.page !== 1) {
        useStore.setState({ tourFilters: { ...currentFilters, page: 1 } });
      }

      if (user?.id) {
        await Promise.all([fetchTours(), fetchActiveTours(user.id)]);
      } else {
        await fetchTours();
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, fetchTours, fetchActiveTours]);


  const handleCategoryPress = (categoryId: string) => {
    const currentGenres = tourFilters.genres || [];
    const newGenres = currentGenres.includes(categoryId)
      ? currentGenres.filter(g => g !== categoryId)
      : [...currentGenres, categoryId];
    setTourFilters({ ...tourFilters, genres: newGenres, page: 1 });
  };

  // Data Preparation
  // Show skeleton if globally loading OR we haven't finished first initialization
  const showSkeleton = (!hasInitialized || (loading && tours.length === 0));
  const skeletonData = [1, 2, 3, 4];
  const tourData = showSkeleton ? skeletonData : tours;

  // Grid Logic helper
  const isGrid = viewMode === 'grid';

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

  const isFreeMode = appSettings?.freeToursEnabled && 
                    (!appSettings.freeToursUntil || new Date(appSettings.freeToursUntil) > new Date());

  return (
    <ScreenWrapper
      style={{ backgroundColor: theme.bgPrimary }}
      includeTop={true} // Changed to true
      includeBottom={false}
    >
      {isFreeMode && (
        <Animated.View 
          entering={SlideInDown.delay(500)}
          style={styles.freeBannerWrapper}
        >
          <LinearGradient
            colors={[theme.primary, theme.secondary || theme.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.freeBannerGradient}
          >
            <View style={styles.freeBannerContent}>
              <TextComponent variant="h3" bold color="#fff" style={styles.freeBannerText}>
                ALL TOURS ARE CURRENTLY FREE!
              </TextComponent>
              {appSettings?.freeToursUntil && (
                <View style={styles.freeExpiryBadge}>
                  <TextComponent bold color="#fff" style={{ opacity: 0.9 }}>
                    ENDS: {new Date(appSettings.freeToursUntil).toLocaleDateString()}
                  </TextComponent>
                </View>
              )}
            </View>
          </LinearGradient>
        </Animated.View>
      )}
      <SectionList
        sections={sections}
        style={{ backgroundColor: theme.bgPrimary }}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        ListHeaderComponent={
          <ExploreHeader
            searchText={searchText}
            onSearchTextChange={setSearchText}
            onSearchSubmit={() => {
              const query = (searchText || '').trim();
              if (query !== (tourFilters.searchQuery || '')) {
                setTourFilters({ ...tourFilters, searchQuery: query, page: 1, limit: 5 });
              }
            }}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterPress={() => setFilterVisible(true)}
            selectedGenres={tourFilters.genres || []}
            onCategoryPress={handleCategoryPress}
            activeTour={activeTour}
            user={user}
            onActiveTourPress={(id) => {
              if (activeTour && (activeTour.status === 'PRE_TOUR_LOBBY' || activeTour.status === 'WAITING')) {
                router.push({ pathname: '/lobby', params: { activeTourId: id } });
              } else {
                router.push({ pathname: '/active-tour/[id]' as any, params: { id } });
              }
            }}
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
                <View style={{ flex: 1, paddingRight: 4 }}>
                  {renderTourItem(item.left, true)}
                </View>
                <View style={{ flex: 1, paddingLeft: 4 }}>
                  {item.right ? renderTourItem(item.right, true) : <View style={{ flex: 1 }} />}
                </View>
              </View>
            );
          }
          return renderTourItem(item, false);
        }}
        onEndReached={() => {
          if (!loading && !showSkeleton && tours.length >= (tourFilters.limit || 5)) {
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
        <FadeInItem index={0}>
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
            reviewCount={(tourItem as any).reviewCount ?? tourItem.reviews?.length ?? 0}
            points={tourItem.points}
            location={tourItem.location}
            modes={tourItem.modes}
            tourType={tourItem.type}
            genre={(tourItem as any).genre}
            variant={gridMode ? 'grid' : 'hero'}
            onPress={async () => {
              fetchTourDetails(tourItem.id, tourItem);
              router.push({ pathname: '/tour/[id]', params: { id: tourItem.id } });
            }}
            onEdit={(tourItem as any).type === 'created' ? () => router.push({ pathname: '/(tabs)/create', params: { tourId: tourItem.id } }) : undefined}
          />
        </FadeInItem>
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
    marginBottom: 8,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyScrollContent: {
    flexGrow: 1,
  },
  freeBannerWrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  freeBannerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  freeBannerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  freeBannerText: {
    textAlign: 'center',
    letterSpacing: 0.5,
    fontSize: 18,
  },
  freeExpiryBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  }
});



