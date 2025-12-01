import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Stop, Tour } from '../types/models';
import { tourService } from '../services/tourService';

export default function MapScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, []);

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
            edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 100);
      }
    } else if (!selectedTour && tours.length > 0 && mapRef.current) {
      // Reset view to show all tour start points
      // We can collect all start points and fit to them
      const startPoints: LatLng[] = [];
      tours.forEach((tour: any) => {
        if (tour.stops && tour.stops.length > 0) {
          // Assuming stops are ordered or we find the one with order 1
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

  const loadTours = async () => {
    try {
      setLoading(true);
      const allTours = await tourService.getAllTours();
      // Cast to unknown then Tour[q] to avoid Prisma enum mismatch
      setTours(allTours as unknown as Tour[]);
    } catch (error) {
      console.error("Failed to load tours:", error);
    } finally {
      setLoading(false);
    }
  };

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
          latitude: 51.5074, // Default to London if no tours
          longitude: -0.1278,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {!selectedTour ? (
          // Show start point of all tours
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
          // Show all stops and route for selected tour
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
        <View style={[styles.tourInfo, { bottom: insets.bottom + 20, backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
          <Text style={[styles.tourTitle, { color: theme.textPrimary }]}>{selectedTour.title}</Text>
          <Text style={[styles.tourDesc, { color: theme.textSecondary }]}>
            {selectedTour.distance} km • {selectedTour.duration} min
          </Text>
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
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center'
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tourDesc: {
    fontSize: 14,
  }
});