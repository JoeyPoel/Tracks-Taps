import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapTourCard from '../components/mapScreen/MapTourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useMapScreenLogic } from '../hooks/useMapScreenLogic';
import { Stop } from '../types/models';
import { getStopIcon } from '../utils/stopIcons';

export default function MapScreen() {
  const { theme } = useTheme();
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
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
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
            const lat = tour.startLat ?? (tour.stops?.find((s: Stop) => s.order === 1) || tour.stops?.[0])?.latitude;
            const lng = tour.startLng ?? (tour.stops?.find((s: Stop) => s.order === 1) || tour.stops?.[0])?.longitude;

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
                pinColor={theme.primary}
              />
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
              >
                <View style={[styles.markerContainer, { backgroundColor: stop.order === 1 ? theme.primary : theme.bgSecondary }]}>
                  {getStopIcon(stop.type, 20, stop.order === 1 ? 'white' : theme.textPrimary)}
                </View>
              </Marker>
            ))}

            {routeSegments && routeSegments.map((segment: any, index: number) => (
              <Polyline
                key={index}
                coordinates={segment.coords}
                strokeColor={theme.primary}
                strokeWidth={3}
                lineDashPattern={segment.type === 'DIRECT' ? [5, 5] : undefined}
              />
            ))}
          </>
        )}
      </MapView>

      {selectedTour && (
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              top: insets.top + 16,
              backgroundColor: theme.bgSecondary,
              shadowColor: theme.shadowColor
            }
          ]}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
          <Text style={[styles.backText, { color: theme.primary }]}>{t('backToAllTours')}</Text>
        </TouchableOpacity>
      )}

      {selectedTour && (
        <View style={[styles.tourInfo, { bottom: insets.bottom + 20 }]}>
          <MapTourCard
            title={selectedTour.title}
            author={(selectedTour as any).author?.name || 'Tracks & Taps'}
            distance={`${(selectedTour as any).distance} km`}
            duration={`${(selectedTour as any).duration} min`}
            stops={(selectedTour as any).stops?.length || 0}
            rating={(selectedTour as any).rating || 0}
            reviewCount={(selectedTour as any).reviewCount || 0}
            points={(selectedTour as any).points || 0}
            onPress={() => {
              router.push(`/tour/${selectedTour.id}`);
            }}
          />
        </View>
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
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  tourInfo: {
    position: 'absolute',
    left: 20,
    right: 20,
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
  markerContainer: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});