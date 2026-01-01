import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdjustmentsHorizontalIcon, ListBulletIcon, MagnifyingGlassIcon, Squares2X2Icon } from 'react-native-heroicons/outline';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

  const CATEGORIES = [
    { id: 'PubGolf', label: 'Pub Golf', icon: '🍺' },
    { id: 'History', label: 'History', icon: '🏛️' },
    { id: 'Culture', label: 'Culture', icon: '🎨' },
    { id: 'Nature', label: 'Nature', icon: '🌳' },
    { id: 'Mystery', label: 'Mystery', icon: '🕵️' },
  ];

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

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 20, paddingBottom: 8, paddingTop: 10 }}>
      <ScreenHeader
        title={t('explore') || 'Explore'}
        subtitle={t('findYourNextAdventure')}
        style={[styles.headerTop, { paddingHorizontal: 0, paddingTop: 0 }]}
      />

      {/* Search Bar */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(600).springify()}
        style={[
          styles.searchContainer,
          { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor },
        ]}
      >
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
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.bgPrimary }]}
          onPress={() => setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'))}
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
                    borderColor: isSelected ? theme.primary : theme.borderPrimary,
                  },
                ]}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    { color: isSelected ? '#FFF' : theme.textPrimary },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

      </Animated.View>

      {/* Active Tour */}
      {activeTour && (() => {
        const currentTeam = activeTour.teams?.find((t: any) => t.userId === user?.id) || activeTour.teams?.[0];
        const totalStops = activeTour.tour?._count?.stops || activeTour.tour?.stops?.length || 1;
        const currentStop = currentTeam?.currentStop || 1;
        const progress = Math.min(Math.max((currentStop - 1) / totalStops, 0), 1);

        return (
          <View style={styles.activeTourSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
              {t('currentAdventure') || 'Current Adventure'}
            </Text>
            <ActiveTourCard
              title={activeTour.tour?.title || ''}
              imageUrl={activeTour.tour?.imageUrl || ''}
              progress={progress}
              onResume={() =>
                router.push({ pathname: '/active-tour/[id]' as any, params: { id: activeTour.id } })
              }
            />
          </View>
        );
      })()}
    </View>
  );

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

  const sections = [
    {
      title: t('popularTours') || 'Popular Tours',
      data: formattedTours,
    },
  ];

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
        ListHeaderComponent={renderHeader}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.popularToursHeader, { backgroundColor: theme.bgPrimary }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 4 }]}>
              {title}
            </Text>
            <Text style={[styles.popularToursSubtitle, { color: theme.textSecondary }]}>{t('curatedAdventures')}</Text>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
  headerTop: {
    marginTop: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
  categoryContainer: {
    // Just styling for the horz scroll
    paddingLeft: 20, // Only padding left to start
    paddingRight: 8, // Padding right less because gaps hande it
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1.5,
    marginRight: 12, // Add gap between items
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
    letterSpacing: -0.3,
  },
  activeTourSection: {
    marginTop: 16,
    marginBottom: 8, // Reduced from 24 to 8 to decrease space between Active Tour and Popular Tours
  },
  popularToursHeader: {
    paddingHorizontal: 20,
    paddingTop: 8, // Reduced from 16 to 8
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  popularToursSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
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
  }
});



