import React, { useState } from 'react';
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
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});

  const toggleExpand = (stopId: string) => {
    setExpandedStops(prev => ({
      ...prev,
      [stopId]: !prev[stopId]
    }));
  };

  const parseOpeningHoursToDays = (hoursStr: string | null | undefined) => {
    if (!hoursStr) return [];
    const daysFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const cleanStr = hoursStr.trim();

    // 1. Open 24 hours
    if (cleanStr.toLowerCase() === 'open 24 hours' || cleanStr.toLowerCase() === '24/7' || cleanStr.toLowerCase() === 'open 24h') {
      return daysFull.map(d => ({ day: d, hours: 'Open 24h' }));
    }

    // 2. Daily: 09:00–18:00
    if (cleanStr.toLowerCase().startsWith('daily:')) {
      const hours = cleanStr.substring(6).trim();
      return daysFull.map(d => ({ day: d, hours }));
    }

    // 3. Mon–Fri: 09:00–18:00, Sat–Sun: Closed
    if (cleanStr.includes('Mon–Fri') || cleanStr.includes('Mon-Fri')) {
      const parts = cleanStr.split(',');
      let weekdayHours = 'Closed';
      let weekendHours = 'Closed';
      
      parts.forEach(part => {
        const p = part.trim();
        if (p.startsWith('Mon–Fri') || p.startsWith('Mon-Fri')) {
          weekdayHours = p.substring(p.indexOf(':') + 1).trim();
        } else if (p.startsWith('Sat–Sun') || p.startsWith('Sat-Sun')) {
          weekendHours = p.substring(p.indexOf(':') + 1).trim();
        }
      });

      return daysFull.map((d, idx) => {
        const isWeekend = idx >= 5;
        return { day: d, hours: isWeekend ? weekendHours : weekdayHours };
      });
    }

    // 4. Custom daily split: "Mon: 09:00-18:00, Tue: ..."
    if (cleanStr.includes(':')) {
      const parts = cleanStr.split(',');
      const scheduleMap: Record<string, string> = {};
      parts.forEach(part => {
        const colonIdx = part.indexOf(':');
        if (colonIdx !== -1) {
          const dayPrefix = part.substring(0, colonIdx).trim().toLowerCase();
          const hours = part.substring(colonIdx + 1).trim();
          scheduleMap[dayPrefix] = hours;
        }
      });

      return daysFull.map((day, idx) => {
        const short = daysShort[idx].toLowerCase();
        const full = day.toLowerCase();
        const hours = scheduleMap[short] || scheduleMap[full] || 'Closed';
        return { day, hours };
      });
    }

    return [{ day: 'Opening Hours', hours: cleanStr }];
  };

  const renderTicketInfo = (info: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = info.match(urlRegex);
    
    if (match && match.length > 0) {
      const url = match[0];
      const cleanText = info.replace(urlRegex, '').trim();
      return (
        <View style={styles.ticketLinkContainer}>
          {cleanText ? (
            <TextComponent style={styles.ticketInfoText} color={theme.textSecondary}>
              {cleanText}
            </TextComponent>
          ) : null}
          <TouchableOpacity
            onPress={() => Linking.openURL(url).catch(err => console.error("URL error", err))}
            style={[styles.ticketLinkButton, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="cart-outline" size={14} color={theme.textOnPrimary} style={{ marginRight: 4 }} />
            <TextComponent style={styles.ticketLinkButtonText} color={theme.textOnPrimary} bold>
              Book Tickets
            </TextComponent>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TextComponent style={styles.ticketInfoText} color={theme.textSecondary}>
        {info}
      </TextComponent>
    );
  };

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
                {/* Main Row: Image, Text Details, Navigate button */}
                <View style={styles.stopCardMainRow}>
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
                  </View>

                  {/* Compass Navigation Button */}
                  <TouchableOpacity
                    onPress={() => handleNavigate(stop)}
                    style={[styles.navButton, { backgroundColor: theme.primary }]}
                  >
                    <Ionicons name="navigate" size={16} color={theme.textOnPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Minimal Badges Row (At the bottom of the card container) */}
                <View style={[styles.metaRow, { marginTop: 8, paddingLeft: stop.imageUrl ? 62 : 12 }]}>
                  {stop.requiresTicket === true ? (
                    <View style={[styles.metaBadgeOutline, { borderColor: mode === 'dark' ? '#f87171' : '#DC2626' }]}>
                      <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#f87171' : '#DC2626' }]}>
                        🎟 {t('ticketRequired' as any) || 'Ticket Required'}
                      </TextComponent>
                    </View>
                  ) : (
                    stop.isFreeEntry === true && (
                      <View style={[styles.metaBadgeOutline, { borderColor: mode === 'dark' ? '#34d399' : '#15803D' }]}>
                        <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#34d399' : '#15803D' }]}>
                          🆓 {t('freeEntry' as any) || 'Free Entry'}
                        </TextComponent>
                      </View>
                    )
                  )}

                  {stop.requiresTicket === true && stop.requiresReservation === 'YES' && (
                    <View style={[styles.metaBadgeOutline, { borderColor: mode === 'dark' ? '#f87171' : '#DC2626' }]}>
                      <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#f87171' : '#DC2626' }]}>
                        📅 {t('reservationRequired' as any) || 'Res. Required'}
                      </TextComponent>
                    </View>
                  )}

                  {stop.requiresTicket === true && stop.requiresReservation === 'MAYBE' && (
                    <View style={[styles.metaBadgeOutline, { borderColor: mode === 'dark' ? '#fbbf24' : '#D97706' }]}>
                      <TextComponent style={[styles.metaBadgeText, { color: mode === 'dark' ? '#fbbf24' : '#D97706' }]}>
                        📅 {t('reservationRecommended' as any) || 'Res. Recommended'}
                      </TextComponent>
                    </View>
                  )}

                </View>

                {/* Expandable trigger button for hours / ticket details (Always beneath labels) */}
                {((stop.openingHours && stop.openingHours !== 'Open 24 hours') || stop.requiresTicket === true) && (
                  <TouchableOpacity 
                    onPress={() => toggleExpand(String(stop.id || index))}
                    style={[styles.expandTextTrigger, { marginTop: 4, paddingLeft: stop.imageUrl ? 62 : 12 }]}
                  >
                    <TextComponent style={styles.expandText} color={theme.primary} bold>
                      {expandedStops[String(stop.id || index)] 
                        ? `${t('showLess' as any) || 'Show Less'} ▲` 
                        : `${t('ticketsAndHours' as any) || 'Hours & Prices'} ▼`}
                    </TextComponent>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Expandable Section */}
              {expandedStops[String(stop.id || index)] && (
                <View style={[styles.expandablePanel, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                  {/* 1. Opening Hours Table */}
                  {stop.openingHours && stop.openingHours !== 'Open 24 hours' && (
                    <View style={styles.expandableSectionBlock}>
                      <TextComponent bold style={styles.sectionLabel} color={theme.textPrimary}>
                        🕐 {t('openingHours' as any) || 'Opening Hours'}
                      </TextComponent>
                      {parseOpeningHoursToDays(stop.openingHours).map((item, idx) => (
                        <View key={idx} style={styles.hoursRow}>
                          <TextComponent style={styles.hoursDay} color={theme.textSecondary}>
                            {item.day}
                          </TextComponent>
                          <TextComponent style={styles.hoursTime} color={theme.textPrimary} bold={item.hours !== 'Closed'}>
                            {item.hours}
                          </TextComponent>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 2. Ticket Prices */}
                  {stop.requiresTicket === true && stop.ticketPrice && stop.ticketPrice !== '[]' && (
                    <View style={styles.expandableSectionBlock}>
                      <TextComponent bold style={styles.sectionLabel} color={theme.textPrimary}>
                        💵 {t('ticketPrices' as any) || 'Ticket Prices'}
                      </TextComponent>
                      {(() => {
                        const priceStr = stop.ticketPrice;
                        if (priceStr && priceStr.startsWith('[')) {
                          try {
                            let arr = JSON.parse(priceStr);
                            if (Array.isArray(arr) && arr.length > 0) {
                              if (Array.isArray(arr[0])) arr = arr[0];
                              return arr.map((opt: any, idx: number) => {
                                if (!opt.price) return null;
                                return (
                                  <View key={idx} style={styles.hoursRow}>
                                    <TextComponent style={styles.hoursDay} color={theme.textSecondary}>
                                      {opt.category || 'General'}
                                    </TextComponent>
                                    <TextComponent style={styles.hoursTime} color={theme.textPrimary} bold>
                                      {opt.price}
                                    </TextComponent>
                                  </View>
                                );
                              });
                            }
                          } catch (e) {}
                        }
                        return (
                          <View style={styles.hoursRow}>
                            <TextComponent style={styles.hoursDay} color={theme.textSecondary}>
                              General Admission
                            </TextComponent>
                            <TextComponent style={styles.hoursTime} color={theme.textPrimary} bold>
                              {stop.ticketPrice || stop.ticketInfo || 'Ticket Required'}
                            </TextComponent>
                          </View>
                        );
                      })()}
                    </View>
                  )}

                  {/* 3. Ticket Info / Booking Link */}
                  {stop.requiresTicket === true && stop.ticketInfo && (
                    <View style={styles.expandableSectionBlock}>
                      <TextComponent bold style={styles.sectionLabel} color={theme.textPrimary}>
                        ℹ️ {t('additionalTicketInfo' as any) || 'Additional Ticket Info'}
                      </TextComponent>
                      {renderTicketInfo(stop.ticketInfo)}
                    </View>
                  )}
                </View>
              )}

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

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <TextComponent style={styles.disclaimerText} color={theme.textSecondary}>
          {t('infoDisclaimerHours' as any) || '⏱ Opening times, prices, and entry requirements may not be up to date. Tracks & Taps is not responsible for inaccuracies. Always verify with the venue directly before visiting.'}
        </TextComponent>
      </View>
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
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  stopCardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
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
  metaBadgeOutline: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  metaBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  expandTextTrigger: {
    paddingVertical: 3,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  expandText: {
    fontSize: 10.5,
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
  disclaimerContainer: {
    marginTop: 20,
    marginHorizontal: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(148,163,184,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
    opacity: 0.75,
  },
  expandablePanel: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    width: '100%',
  },
  expandableSectionBlock: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    opacity: 0.9,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(148,163,184,0.1)',
  },
  hoursDay: {
    fontSize: 11,
  },
  hoursTime: {
    fontSize: 11,
  },
  ticketLinkContainer: {
    gap: 6,
    marginTop: 2,
  },
  ticketInfoText: {
    fontSize: 11,
    lineHeight: 15,
  },
  ticketLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  ticketLinkButtonText: {
    fontSize: 10,
  },
});
