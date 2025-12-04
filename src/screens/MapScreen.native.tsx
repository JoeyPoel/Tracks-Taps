import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapTourCard from '../components/mapScreen/MapTourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useMapTours } from '../hooks/useMapTour';
import { Stop, Tour } from '../types/models';
import { router } from 'expo-router';

export default function MapScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const {tours, loading, refetch } = useMapTours();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  useEffect(() => {
    if (selectedTour && mapRef.current) {
      // Zoom to fit the selected tour's stops
      const stops = (selectedTour as any).stops || [];
      if (stops.length > 0) {
        const coordinates = stops.map((s: Stop) => ({
          latitude: s.latitude,
          longitude: s.longitude,
        }));

        // Add a small delay to ensure map is ready
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 250, left: 50 }, // Increased bottom padding for card
            animated: true,
          });
        }, 100);
      }
    } else if (!selectedTour && tours.length > 0 && mapRef.current) {
      // Reset view to show all tour start points
      const startPoints: LatLng[] = [];
      tours.forEach((tour: any) => {
        if (tour.stops && tour.stops.length > 0) {
          const firstStop = tour.stops.find((s: Stop) => s.order === 1) || tour.stops[0];
          if (firstStop) {
            startPoints.push({
              latitude: firstStop.latitude,
              longitude: firstStop.longitude
            });
          }
        }
      });

      if (startPoints.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(startPoints, {
            edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedTour, tours]);

  const handleTourSelect = (tour: Tour) => {
    setSelectedTour(tour);
  };

  const handleBack = () => {
    setSelectedTour(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPrimary, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {!selectedTour ? (
          tours.map((tour: any) => {
            const firstStop = tour.stops?.find((s: Stop) => s.order === 1) || tour.stops?.[0];
            if (!firstStop) return null;

            return (
              <Marker
                key={tour.id}
                coordinate={{
                  latitude: firstStop.latitude,
                  longitude: firstStop.longitude,
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
                pinColor={stop.order === 1 ? theme.primary : theme.secondary}
              />
            ))}

            {(selectedTour as any).stops && (selectedTour as any).stops.length > 1 && (
              <Polyline
                coordinates={(selectedTour as any).stops
                  .sort((a: Stop, b: Stop) => a.order - b.order)
                  .map((s: Stop) => ({
                    latitude: s.latitude,
                    longitude: s.longitude,
                  }))}
                strokeColor={theme.primary}
                strokeWidth={3}
                lineDashPattern={[5, 5]}
              />
            )}
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
});