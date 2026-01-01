import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, ListBulletIcon, MagnifyingGlassIcon, Squares2X2Icon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import ActiveTourCard from '../components/exploreScreen/ActiveTourCard';
import ExploreFilterSidebar from '../components/exploreScreen/ExploreFilterSidebar';
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
  const error = useStore((state) => state.errorTours || state.errorActiveTours);
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

  const [headerHeight, setHeaderHeight] = useState(300); // Default guess or estimate
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event: any) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: scrollY.value < 0 ? 0 : -scrollY.value,
        },
      ],
    };
  });

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

  const onRefresh = useCallback(async () => {
    if (user?.id) {
      // Force fetch everything
      await Promise.all([
        fetchTours(),
        fetchActiveTours(user.id)
      ]);
    }
  }, [user?.id, fetchTours, fetchActiveTours]);

  const handleCategoryPress = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    setTourFilters({ ...tourFilters, searchQuery: newCategory ? categoryId : '', page: 1 });
    setSearchText(newCategory ? categoryId : '');
  };


  const renderHeaderContent = () => (
    <View
      onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      style={{ paddingBottom: 8, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: theme.bgPrimary }}
    >
      <View style={{ paddingHorizontal: 20 }}>
        {/* Header Title */}
        <ScreenHeader
          title={t('explore') || 'Explore'}
          subtitle={t('findYourNextAdventure')}
          style={[styles.headerTop, { paddingHorizontal: 0 }]}
        />

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(100).duration(600).springify()} style={[styles.searchContainer, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <MagnifyingGlassIcon size={20} color={theme.textSecondary} style={{ marginRight: 12 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('whereToNext')}
            placeholderTextColor={theme.textSecondary + '80'}
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
          {/* View Toggle */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.bgPrimary }]}
            onPress={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
          >
            {viewMode === 'list' ? (
              <Squares2X2Icon size={20} color={theme.textPrimary} />
            ) : (
              <ListBulletIcon size={20} color={theme.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.bgPrimary, marginLeft: 8 }]}
            onPress={() => setFilterVisible(true)}
          >
            <AdjustmentsHorizontalIcon size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
      </View>

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
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
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

      <View style={{ paddingHorizontal: 20 }}>
        {/* Active Tour (if any) */}
        {activeTour && (() => {
          const currentTeam = activeTour.teams?.find((t: any) => t.userId === user?.id) || activeTour.teams?.[0];
          const totalStops = activeTour.tour?._count?.stops || activeTour.tour?.stops?.length || 1;
          const currentStop = currentTeam?.currentStop || 1;
          const progress = Math.min(Math.max((currentStop - 1) / totalStops, 0), 1);

          return (
            <View style={styles.activeTourSection}>
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

        <View style={styles.popularToursHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 4 }]}>{t('popularTours') || 'Popular Tours'}</Text>
          <Text style={[styles.popularToursSubtitle, { color: theme.textSecondary }]}>{t('curatedAdventures')}</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    const isGrid = viewMode === 'grid';
    const numColumns = isGrid ? 2 : 1;

    // Loading Skeletons Logic
    // Only show skeleton if we have NO data. If we have data, we show it (memory) + RefreshControl spinner.
    const showSkeleton = loading && tours.length === 0;
    const dataToRender = showSkeleton ? [1, 2, 3, 4, 5, 6] : tours;

    return (
      <Animated.FlatList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        key={viewMode}
        data={dataToRender as any}
        keyExtractor={(item) => (typeof item === 'number' ? `skeleton-${item}` : item.id.toString())}
        numColumns={numColumns}
        columnWrapperStyle={isGrid ? { justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 20 } : undefined}
        refreshControl={
          <RefreshControl
            refreshing={loading && !showSkeleton}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressViewOffset={headerHeight}
          />
        }
        renderItem={({ item }) => {
          if (showSkeleton) {
            return (
              <View style={[
                !isGrid && { marginBottom: 12 },
                isGrid && { width: '48%' },
                !isGrid && { paddingHorizontal: 20 }
              ]}>
                <TourSkeleton variant={isGrid ? 'grid' : 'hero'} />
              </View>
            );
          }

          const tourItem = item as unknown as Tour;
          return (
            <View style={[
              !isGrid && { marginBottom: 12 },
              isGrid && { width: '48%' },
              !isGrid && { paddingHorizontal: 20 }
            ]}>
              <Animated.View entering={FadeInDown.duration(400)}>
                <TourCard
                  title={tourItem.title}
                  author={tourItem.author?.name || t('unknown')}
                  imageUrl={tourItem.imageUrl}
                  distance={`${tourItem.distance} km`}
                  duration={`${tourItem.duration} min`}
                  stops={tourItem._count?.stops || 0}
                  rating={tourItem.reviews && tourItem.reviews.length > 0
                    ? tourItem.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / tourItem.reviews.length
                    : 0}
                  reviewCount={tourItem.reviews?.length || 0}
                  points={tourItem.points}
                  modes={tourItem.modes}
                  tourType={tourItem.type}
                  genre={(tourItem as any).genre}
                  variant={isGrid ? 'grid' : 'hero'}
                  onPress={async () => {
                    fetchTourDetails(tourItem.id, tourItem);
                    router.push({ pathname: '/tour/[id]', params: { id: tourItem.id } });
                  }}
                />
              </Animated.View>
            </View>
          );
        }}
        // iOS: use contentInset to push content down and allow RefreshControl to appear in the gap
        contentInset={Platform.OS === 'ios' ? { top: headerHeight } : undefined}
        contentOffset={Platform.OS === 'ios' ? { x: 0, y: -headerHeight } : undefined}
        // Android: use padding (contentInset not fully supported/same behavior)
        contentContainerStyle={Platform.OS === 'ios'
          ? styles.scrollContent
          : { ...styles.scrollContent, paddingTop: headerHeight }
        }
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (!loading && tours.length >= (tourFilters.limit || 20) && !showSkeleton) {
            setTourFilters({ ...tourFilters, page: (tourFilters.page || 1) + 1 });
          }
        }}
        onEndReachedThreshold={0.5}
      />
    );
  };

  return (
    <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} includeBottom={false}>
      <Animated.View style={[headerAnimatedStyle, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }]}>
        {renderHeaderContent()}
      </Animated.View>
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
    padding: 20,
  },
  headerTop: {
    marginTop: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14, // Slightly taller
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Subtle shadow
    shadowRadius: 12,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButton: {
    padding: 8,
    borderRadius: 50,
    marginLeft: 8,
  },
  categoryContainer: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8, // Avoid clipping shadows
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1.5,
  },
  categoryIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  categoryText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  activeTourSection: {
    marginTop: 32,
    marginBottom: 8,
  },
  popularToursHeader: {
    marginTop: 32,
    marginBottom: 16,
  },
  popularToursSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 0,
    marginBottom: 4,
    opacity: 0.7,
  },
  scrollContent: {
    paddingBottom: 110,
  }
});


