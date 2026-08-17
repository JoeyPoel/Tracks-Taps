import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { TextComponent } from './TextComponent';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Stop } from '../../types/models';
import { getStopIcon } from '../../utils/stopIcons';

const { width: screenWidth } = Dimensions.get('window');

interface ItineraryViewProps {
  stops: Stop[];
  onStopPress?: (stop: Stop) => void;
  activeStopIndex?: number;
}

export function ItineraryView({ stops, onStopPress, activeStopIndex }: ItineraryViewProps) {
  const { theme, mode } = useTheme();
  const { t } = useLanguage();

  if (!stops || stops.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="map-outline" size={48} color={theme.textSecondary} />
        <TextComponent style={{ marginTop: 12 }} color={theme.textSecondary}>
          {t('noStopsAvailable' as any) || 'No stops available for this tour.'}
        </TextComponent>
      </View>
    );
  }

  // Calculate distance between two points in km
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format category badge styles
  const getCategoryStyles = (type: string) => {
    const typeLower = (type || '').toLowerCase();
    
    // Determine label
    const label = (() => {
      const mappings: Record<string, string> = {
        food_dining: t('foodDining' as any) || 'Food & Dining',
        coffee_drink: t('coffeeDrink' as any) || 'Coffee & Drinks',
        nightlife: t('nightlife' as any) || 'Nightlife',
        museum_art: t('museumArt' as any) || 'Museum & Art',
        monument_landmark: t('monumentLandmark' as any) || 'Monument & Landmark',
        religious: t('religious' as any) || 'Religious',
        nature_park: t('naturePark' as any) || 'Nature & Park',
        shopping: t('shopping' as any) || 'Shopping',
        transit_stop: t('transitStop' as any) || 'Transit Stop',
        viewpoint: t('viewpoint' as any) || 'Viewpoint',
        info_point: t('infoPoint' as any) || 'Info Point',
        facilities: t('facilities' as any) || 'Facilities',
      };
      if (mappings[typeLower]) return mappings[typeLower];
      if (mappings[type]) return mappings[type];
      
      // Fallback formatting
      return type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    })();

    // Determine colors
    const isDark = mode === 'dark';
    if (typeLower.includes('monument') || typeLower.includes('landmark') || typeLower.includes('attraction')) {
      return {
        bg: isDark ? 'rgba(244, 63, 94, 0.15)' : '#FFE4E6',
        text: isDark ? '#f43f5e' : '#E11D48',
        label
      };
    }
    if (typeLower.includes('museum') || typeLower.includes('art') || typeLower.includes('history')) {
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.15)' : '#F1F5F9',
        text: isDark ? '#cbd5e1' : '#475569',
        label
      };
    }
    if (typeLower.includes('food') || typeLower.includes('drink') || typeLower.includes('bar') || typeLower.includes('nightlife') || typeLower.includes('coffee') || typeLower.includes('cafe')) {
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
        text: isDark ? '#fbbf24' : '#D97706',
        label
      };
    }
    if (typeLower.includes('nature') || typeLower.includes('park') || typeLower.includes('outdoor')) {
      return {
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#DCFCE7',
        text: isDark ? '#34d399' : '#15803D',
        label
      };
    }
    return {
      bg: isDark ? 'rgba(14, 165, 233, 0.15)' : '#E0F2FE',
      text: isDark ? '#38bdf8' : '#0284C7',
      label
    };
  };

  const handleNavigate = (stop: Stop) => {
    const lat = stop.latitude;
    const lng = stop.longitude;
    const label = encodeURIComponent(stop.name);
    const url = Platform.select({
      ios: `maps://app?daddr=${lat},${lng}&q=${label}`,
      android: `google.navigation:q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to browser Google Maps
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
      })
      .catch((err) => console.error('An error occurred opening navigation map', err));
  };

  return (
    <View style={styles.container}>
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;
        const category = getCategoryStyles(stop.type || 'other');
        const isActive = activeStopIndex !== undefined && index === activeStopIndex;

        // Calculate transit to next stop
        let distanceText = '';
        let durationText = '';
        if (!isLast) {
          const nextStop = stops[index + 1];
          const distKm = getDistance(stop.latitude, stop.longitude, nextStop.latitude, nextStop.longitude);
          const durationMin = Math.round(distKm * 12); // Average walking speed: ~5km/h, so 12 min per km
          
          distanceText = distKm < 1 ? `${Math.round(distKm * 1000)}m` : `${distKm.toFixed(1)}km`;
          durationText = `${durationMin}m`;
        }

        return (
          <View key={stop.id || index} style={styles.timelineRow}>
            {/* Left Timeline Channel */}
            <View style={styles.timelineLeft}>
              {/* Vertical Dashed / Solid Line */}
              {!isLast && (
                <View style={[styles.timelineLine, { borderColor: theme.borderPrimary }]} />
              )}
              {/* Circle Number Badge */}
              <TouchableOpacity
                onPress={() => onStopPress?.(stop)}
                disabled={!onStopPress}
                style={[
                  styles.circleBadge,
                  {
                    backgroundColor: isActive ? theme.primary : theme.bgSecondary,
                    borderColor: isActive ? theme.primary : theme.borderPrimary,
                  },
                ]}
              >
                <TextComponent
                  bold
                  style={{ fontSize: 13, color: isActive ? theme.textOnPrimary : theme.textSecondary }}
                >
                  {stop.number || index + 1}
                </TextComponent>
              </TouchableOpacity>
            </View>

            {/* Right Card Channel */}
            <View style={styles.timelineRight}>
              <TouchableOpacity
                onPress={() => onStopPress?.(stop)}
                disabled={!onStopPress}
                style={[
                  styles.stopCard,
                  {
                    backgroundColor: theme.bgSecondary,
                    borderColor: isActive ? theme.primary : theme.borderPrimary,
                    borderWidth: isActive ? 2 : 1,
                  },
                ]}
              >
                {/* Image */}
                {stop.imageUrl ? (
                  <Image
                    source={{ uri: stop.imageUrl }}
                    style={styles.stopImage}
                    contentFit="cover"
                  />
                ) : null}

                {/* Stop Details */}
                <View style={styles.stopInfo}>
                  <TextComponent variant="body" bold color={theme.textPrimary} style={styles.stopName}>
                    {stop.name}
                  </TextComponent>
                  
                  {/* Category Badge */}
                  <View style={[styles.categoryBadge, { backgroundColor: category.bg }]}>
                    {getStopIcon(stop.type, 12, category.text)}
                    <TextComponent style={[styles.categoryText, { color: category.text }]}>
                      {category.label}
                    </TextComponent>
                  </View>

                  {/* Ticket + Free Entry badges */}
                  <View style={styles.metaRow}>
                    {stop.requiresTicket === true && (
                      <>
                        <View style={[styles.metaBadge, { backgroundColor: mode === 'dark' ? 'rgba(239,68,68,0.15)' : '#FEE2E2' }]}>
                          <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#f87171' : '#DC2626' }]}>
                            🎟 {stop.ticketPrice ? stop.ticketPrice : (stop.ticketInfo ? stop.ticketInfo.split('—')[0].trim() : 'Ticket required')}
                          </TextComponent>
                        </View>
                        {stop.requiresReservation === true && (
                          <View style={[styles.metaBadge, { backgroundColor: mode === 'dark' ? 'rgba(245,158,11,0.15)' : '#FEF3C7' }]}>
                            <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#fbbf24' : '#D97706' }]}>
                              📅 Reservation required
                            </TextComponent>
                          </View>
                        )}
                        {stop.ticketInfo ? (
                          <View style={[styles.metaBadge, { backgroundColor: mode === 'dark' ? 'rgba(148,163,184,0.15)' : '#F1F5F9' }]}>
                            <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#cbd5e1' : '#475569' }]}>
                              ℹ️ {stop.ticketInfo.includes('—') ? stop.ticketInfo.split('—')[1].trim() : stop.ticketInfo}
                            </TextComponent>
                          </View>
                        ) : null}
                      </>
                    )}
                    {stop.isFreeEntry === true && stop.requiresTicket !== true && (
                      <View style={[styles.metaBadge, { backgroundColor: mode === 'dark' ? 'rgba(16,185,129,0.15)' : '#DCFCE7' }]}>
                        <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#34d399' : '#15803D' }]}>
                          🆓 Free entry
                        </TextComponent>
                      </View>
                    )}
                    {stop.openingHours && stop.openingHours !== 'Open 24 hours' && (
                      <View style={[styles.metaBadge, { backgroundColor: mode === 'dark' ? 'rgba(99,102,241,0.15)' : '#EEF2FF' }]}>
                        <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#a5b4fc' : '#4338CA' }]}>
                          🕐 {stop.openingHours}
                        </TextComponent>
                      </View>
                    )}
                    {stop.openingHours === 'Open 24 hours' && (
                      <View style={[styles.metaBadge, { backgroundColor: mode === 'dark' ? 'rgba(16,185,129,0.15)' : '#DCFCE7' }]}>
                        <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#34d399' : '#15803D' }]}>
                          🕐 Open 24h
                        </TextComponent>
                      </View>
                    )}
                  </View>
                </View>

                {/* Compass Navigation Button */}
                <TouchableOpacity
                  onPress={() => handleNavigate(stop)}
                  style={[styles.navButton, { backgroundColor: theme.primary }]}
                >
                  <Ionicons name="navigate" size={16} color={theme.textOnPrimary} />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Transit Pill */}
              {!isLast && distanceText && (
                <View style={styles.transitContainer}>
                  <View style={[styles.transitPill, { backgroundColor: theme.bgTertiary }]}>
                    <Ionicons name="walk-outline" size={14} color={theme.textSecondary} />
                    <TextComponent style={styles.transitText} color={theme.textSecondary}>
                      {durationText} • {distanceText}
                    </TextComponent>
                  </View>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    width: '100%',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    width: '100%',
  },
  timelineLeft: {
    width: 44,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 36,
    bottom: -16,
    left: 22,
    width: 0,
    borderWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  circleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 8,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 4,
    paddingBottom: 24,
  },
  stopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  stopImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  stopInfo: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  stopName: {
    fontSize: 15,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  metaBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transitContainer: {
    alignItems: 'flex-start',
    paddingLeft: 12,
    marginTop: 8,
    marginBottom: -8,
  },
  transitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  transitText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
