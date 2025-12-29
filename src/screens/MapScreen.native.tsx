import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FlagIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TourCard from '../components/exploreScreen/TourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useMapScreenLogic } from '../hooks/useMapScreenLogic';
import { Stop } from '../types/models';
import { getGenreIcon } from '../utils/genres';
import { getStopIcon } from '../utils/stopIcons';

export default function MapScreen() {
  const { theme, mode } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

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
          tours.map((tour: any) => {
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
                tracksViewChanges={false}
              >
                <View style={styles.markerShadowContainer}>
                  <LinearGradient
                    colors={[theme.primary, theme.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumMarker}
                  >
                    {(() => {
                      const GenreIcon = getGenreIcon(tour.genre || 'Adventure');
                      return <GenreIcon size={18} color="white" />;
                    })()}
                  </LinearGradient>
                  <View style={[styles.markerTail, { borderTopColor: '#FFF' }]} />
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
                tracksViewChanges={false}
              >
                {stop.number === 1 ? (
                  // START STOP: Premium Gradient Pin
                  <View style={styles.markerShadowContainer}>
                    <LinearGradient
                      colors={[theme.primary, theme.secondary]}
                      style={styles.premiumMarker}
                    >
                      <FlagIcon size={20} color="white" />
                    </LinearGradient>
                    <View style={[styles.markerTail, { borderTopColor: '#FFF' }]} />
                  </View>
                ) : (
                  // REGULAR STOP: Glassmorphism Bubble
                  <View style={[styles.stopMarker, { backgroundColor: theme.bgPrimary, borderColor: theme.borderSecondary }]}>
                    <View style={[styles.stopIconContainer, { backgroundColor: 'transparent' }]}>
                      {getStopIcon(stop.type, 16, theme.textPrimary)}
                    </View>
                    <View style={[styles.stopNumberBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.stopNumberText}>{stop.number}</Text>
                    </View>
                  </View>
                )}
              </Marker>
            ))}

            {routeSegments && routeSegments.map((segment: any, index: number) => (
              <Polyline
                key={index}
                coordinates={segment.coords}
                strokeColor={theme.primary}
                strokeWidth={4}
                lineDashPattern={segment.type === 'DIRECT' ? [8, 8] : undefined}
              />
            ))}
          </>
        )}
      </MapView>

      {selectedTour && (
        <TouchableOpacity
          style={[
            styles.backButton,
            { top: insets.top + 16 }
          ]}
          onPress={handleBack}
        >
          <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
      )}


      {selectedTour && (
        <Animated.View
          entering={SlideInDown.delay(100).duration(600)}
          style={[styles.tourInfo, { bottom: insets.bottom + 20 }]}
        >
          <TourCard
            title={selectedTour.title}
            author={(selectedTour as any).author?.name || 'Tracks & Taps'}
            imageUrl={selectedTour.imageUrl}
            distance={`${(selectedTour as any).distance} km`}
            duration={`${(selectedTour as any).duration} min`}
            stops={(selectedTour as any).stops?.length || 0}
            rating={selectedTour.reviews && selectedTour.reviews.length > 0
              ? selectedTour.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / selectedTour.reviews.length
              : 0}
            reviewCount={selectedTour.reviews?.length || 0}
            points={(selectedTour as any).points || 0}
            genre={(selectedTour as any).genre || 'Adventure'}
            variant="map"
            onPress={() => {
              router.push(`/tour/${selectedTour.id}`);
            }}
          />
        </Animated.View>
      )}
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
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    shadowOffset: { width: 0, height: 1 },
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
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});