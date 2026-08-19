import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextComponent } from '../components/common/TextComponent';
import TourCard from '../components/exploreScreen/TourCard';
import { AppModal } from '../components/common/AppModal';
import { ItineraryView } from '../components/common/ItineraryView';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useMapScreenLogic } from '../hooks/useMapScreenLogic';
import { Stop } from '../types/models';
import { getGenreIcon } from '../utils/genres';
import { getStopIcon } from '../utils/stopIcons';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useTranslation } from '../context/TranslationContext';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { ScaledTextInput } from '../components/common/ScaledTextInput';
import ExploreFilterSidebar from '../components/exploreScreen/ExploreFilterSidebar';
import { useStore } from '../store/store';
import { BlurView } from 'expo-blur';

export default function MapScreen() {
  const { theme, mode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { speak } = useTextToSpeech();
  const { translateText, isAutoTranslateEnabled, forceTranslate } = useTranslation();

  const {
    mapRef,
    tours,
    loading,
    selectedTour,
    routeSegments,
    handleTourSelect,
    handleBack,
    onRegionChangeComplete
  } = useMapScreenLogic();

  const tourFilters = useStore((state) => state.tourFilters);
  const setTourFilters = useStore((state) => state.setTourFilters);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [searchText, setSearchText] = React.useState(tourFilters.searchQuery || '');
  const [zoomTrigger, setZoomTrigger] = React.useState(0);

  const lastFilterVisible = React.useRef(filterVisible);
  React.useEffect(() => {
    if (lastFilterVisible.current && !filterVisible) {
      setZoomTrigger(prev => prev + 1);
    }
    lastFilterVisible.current = filterVisible;
  }, [filterVisible]);

  React.useEffect(() => {
    if (tourFilters.searchQuery !== searchText) {
      setSearchText(tourFilters.searchQuery || '');
    }
  }, [tourFilters.searchQuery]);

  const filteredTours = React.useMemo(() => {
    return (tours || []).filter((tour: any) => {
      // 1. Search Query
      if (tourFilters.searchQuery) {
        const q = tourFilters.searchQuery.toLowerCase().trim();
        const matchTitle = tour.title?.toLowerCase().includes(q);
        const matchDesc = tour.description?.toLowerCase().includes(q);
        const matchAuthor = tour.author?.name?.toLowerCase().includes(q);
        const matchStops = tour.stops?.some((s: any) => s.name?.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchAuthor && !matchStops) return false;
      }
      // 2. Genres
      if (tourFilters.genres && tourFilters.genres.length > 0) {
        if (!tour.genre || !tourFilters.genres.includes(tour.genre)) return false;
      }
      // 3. Difficulty
      if (tourFilters.difficulty) {
        if (tour.difficulty !== tourFilters.difficulty) return false;
      }
      // 4. Game Modes
      if (tourFilters.modes && tourFilters.modes.length > 0) {
        if (!tour.modes || !tour.modes.some((m: string) => tourFilters.modes!.includes(m))) return false;
      }
      // 5. Distance
      if (tourFilters.minDistance !== undefined) {
        if ((tour.distance || 0) < tourFilters.minDistance) return false;
      }
      if (tourFilters.maxDistance !== undefined) {
        if ((tour.distance || 0) > tourFilters.maxDistance) return false;
      }
      // 6. Duration
      if (tourFilters.minDuration !== undefined) {
        if ((tour.duration || 0) < tourFilters.minDuration) return false;
      }
      if (tourFilters.maxDuration !== undefined) {
        if ((tour.duration || 0) > tourFilters.maxDuration) return false;
      }
      return true;
    });
  }, [tours, tourFilters]);

  React.useEffect(() => {
    if (selectedTour || zoomTrigger === 0) return;

    const coordinates = (filteredTours || [])
      .map(tour => {
        const lat = tour.startLat ?? (tour.stops?.find((s: any) => s.number === 1) || tour.stops?.[0])?.latitude;
        const lng = tour.startLng ?? (tour.stops?.find((s: any) => s.number === 1) || tour.stops?.[0])?.longitude;
        return (lat && lng) ? { latitude: lat, longitude: lng } : null;
      })
      .filter((c): c is { latitude: number; longitude: number } => c !== null);

    if (coordinates.length > 0) {
      let minLat = 90;
      let maxLat = -90;
      let minLng = 180;
      let maxLng = -180;
      coordinates.forEach(c => {
        if (c.latitude < minLat) minLat = c.latitude;
        if (c.latitude > maxLat) maxLat = c.latitude;
        if (c.longitude < minLng) minLng = c.longitude;
        if (c.longitude > maxLng) maxLng = c.longitude;
      });

      const latDelta = Math.max(maxLat - minLat, 0.08);
      const lngDelta = Math.max(maxLng - minLng, 0.08);
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta + 0.04,
          longitudeDelta: lngDelta + 0.04,
        }, 1000);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [zoomTrigger, selectedTour]);

  const [tracksViewChanges, setTracksViewChanges] = React.useState(true);
  const [showItinerary, setShowItinerary] = React.useState(false);

  React.useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [tours, selectedTour]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}

        showsUserLocation={true}
        userInterfaceStyle={mode}
        showsMyLocationButton={false}
        initialRegion={{
          latitude: 52.3676,
          longitude: 4.9041,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {!selectedTour ? (
          (filteredTours || []).map((tour: any) => {
            const lat = tour.startLat ?? (tour.stops?.find((s: Stop) => s.number === 1) || tour.stops?.[0])?.latitude;
            const lng = tour.startLng ?? (tour.stops?.find((s: Stop) => s.number === 1) || tour.stops?.[0])?.longitude;

            if (!lat || !lng) return null;

            return (
              <Marker
                key={tour.id}
                coordinate={{
                  latitude: lat,
                  longitude: lng,
                }}
                title={tour.title}
                description={t('clickToViewRoute')}
                onPress={() => handleTourSelect(tour)}
                tracksViewChanges={tracksViewChanges}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.markerImageWrapper, { borderColor: theme.fixedWhite || '#FFF', backgroundColor: theme.bgSecondary }]}>
                    {tour.imageUrl ? (
                      <ExpoImage
                        source={{ uri: tour.imageUrl }}
                        style={styles.markerImage}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View style={[styles.markerPlaceholder, { backgroundColor: theme.primary }]}>
                        {(() => {
                          const GenreIcon = getGenreIcon(tour.genre || 'Adventure');
                          return <GenreIcon size={20} color={theme.textOnPrimary} />;
                        })()}
                      </View>
                    )}
                  </View>

                  {/* Genre Badge */}
                  <View style={[styles.markerBadge, { backgroundColor: theme.primary, borderColor: theme.fixedWhite || '#FFF' }]}>
                    {(() => {
                      const GenreIcon = getGenreIcon(tour.genre || 'Adventure');
                      return <GenreIcon size={12} color={theme.textOnPrimary} />;
                    })()}
                  </View>

                  {/* Pointer */}
                  <View style={[styles.markerPointer, { borderTopColor: theme.fixedWhite || '#FFF' }]} />
                </View>
              </Marker>
            );
          })
        ) : (
          <>
            {(selectedTour as any).stops?.map((stop: Stop) => (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                title={`${stop.number}. ${stop.name}`}
                description={stop.description}
                tracksViewChanges={tracksViewChanges}
                onPress={async () => {
                  let nameVal = stop.name;
                  let descVal = stop.description || '';
                  if (isAutoTranslateEnabled) {
                    if (nameVal && translateText(nameVal) === nameVal) {
                      await forceTranslate(nameVal);
                    }
                    if (descVal && translateText(descVal) === descVal) {
                      await forceTranslate(descVal);
                    }
                    nameVal = translateText(nameVal);
                    descVal = translateText(descVal);
                  }
                  speak(`${stop.number}. ${nameVal}. ${descVal}`, true);
                }}
              >
                {stop.number === 1 ? (
                  // START STOP: Solid Primary Pin
                  <View style={styles.markerShadowContainer}>
                    <View style={[styles.startMarker, { backgroundColor: theme.primary }]}>
                      <Text style={{ fontSize: 18 }}>🏁</Text>
                    </View>
                    <View style={[styles.markerTail, { borderTopColor: theme.primary }]} />
                  </View>
                ) : (
                  // REGULAR STOP: Glassmorphism Bubble
                  <View style={[styles.stopMarker, { backgroundColor: theme.bgPrimary, borderColor: theme.borderSecondary }]}>
                    <View style={[styles.stopIconContainer, { backgroundColor: theme.bgSecondary }]}>
                      {getStopIcon(stop.type, 16, theme.textPrimary)}
                    </View>
                    <View style={[styles.stopNumberBadge, { backgroundColor: theme.primary, borderColor: theme.textOnPrimary }]}>
                      <TextComponent style={styles.stopNumberText} color={theme.textOnPrimary} bold variant="caption">
                        {stop.number}
                      </TextComponent>
                    </View>
                  </View>
                )}
              </Marker>
            ))}

            {routeSegments && routeSegments.map((segment: any, index: number) => {
              const validCoords = segment.coords && segment.coords.filter((c: any) => c && typeof c.latitude === 'number' && !isNaN(c.latitude) && typeof c.longitude === 'number' && !isNaN(c.longitude));
              if (!validCoords || validCoords.length < 2) return null;
              return (
                <Polyline
                  key={index}
                  coordinates={validCoords}
                  strokeColor={theme.primary}
                  strokeWidth={4} // Thicker line
                />
              );
            })}
          </>
        )}
      </MapView>

      {selectedTour && (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top: insets.top + 16,
              backgroundColor: theme.primary, // "Just pink"
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }
          ]}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {
        selectedTour && (
          <View style={[styles.tourInfo, { bottom: 120 }]}>
            <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => setShowItinerary(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.bgSecondary,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  gap: 6,
                  borderWidth: 1,
                  borderColor: theme.borderPrimary,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="list" size={16} color={theme.primary} />
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: theme.textPrimary }}>
                  {t('itinerary') || 'Itinerary'}
                </Text>
              </TouchableOpacity>
            </View>

            <TourCard
              title={selectedTour.title}
              author={(selectedTour as any).author?.name || 'Tracks & Taps'}
              imageUrl={selectedTour.imageUrl}
              distance={`${(selectedTour as any).distance} km`}
              duration={`${((selectedTour as any).duration / 60).toFixed(1)} ${t('hrs')}`}
              stops={(selectedTour as any).stops?.length || 0}
              rating={selectedTour.averageRating ?? (selectedTour.reviews && selectedTour.reviews.length > 0
                ? selectedTour.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / selectedTour.reviews.length
                : 0)}
              reviewCount={selectedTour.reviewCount ?? selectedTour.reviews?.length ?? 0}
              points={(selectedTour as any).points || 0}
              location={(selectedTour as any).location}
              genre={(selectedTour as any).genre || 'Adventure'}
              tourType={(selectedTour as any).type}
              variant="map"
              onPress={() => {
                router.push(`/tour/${selectedTour.id}`);
              }}
            />

            <AppModal
              visible={showItinerary}
              onClose={() => setShowItinerary(false)}
              title={selectedTour.title}
              subtitle={t('stopsItinerary' as any) || 'Stops Itinerary'}
            >
              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
                <ItineraryView
                  stops={(selectedTour as any).stops || []}
                />
              </ScrollView>
            </AppModal>
          </View>
        )
      }

      {!selectedTour && (
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          style={[
            styles.mapSearchContainer,
            { 
              top: insets.top + 16,
              borderColor: theme.borderPrimary,
              backgroundColor: 'transparent',
              overflow: 'hidden',
            }
          ]}
        >
          <BlurView
            intensity={90}
            tint={mode as any}
            style={styles.searchBlur}
          >
            <Ionicons name="search" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <ScaledTextInput
              style={[styles.mapSearchInput, { color: theme.textSecondary }]}
              placeholder={t('whereToNext') || "Where to next?"}
              placeholderTextColor={theme.textSecondary + '80'}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setTourFilters({ ...tourFilters, searchQuery: text });
              }}
              returnKeyType="search"
              onSubmitEditing={() => {
                setZoomTrigger(prev => prev + 1);
              }}
            />
            <TouchableOpacity
              style={styles.mapFilterButton}
              onPress={() => setFilterVisible(true)}
              accessibilityLabel={t('filterTours') || "Filter tours"}
            >
              <Ionicons name="options-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      )}

      {/* FILTER SIDEBAR */}
      <ExploreFilterSidebar
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tourInfo: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerShadowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  premiumMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  markerTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ translateY: -2 }], // Overlap slightly
  },
  stopMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
  },
  stopIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  stopNumberText: {
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  markerImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  markerImage: {
    width: '100%',
    height: '100%',
  },
  markerPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBadge: {
    position: 'absolute',
    bottom: 6,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  startMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  mapSearchContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  mapFilterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});