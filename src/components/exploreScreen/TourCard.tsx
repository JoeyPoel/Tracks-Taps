

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BoltIcon as BoltIconSolid, ClockIcon, MapIcon, StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getGenreIcon } from '../../utils/genres';
import { getTourTypeLabel } from '../../utils/tourUtils';
import { TextComponent } from '../common/TextComponent';
import { TourCardBase } from './TourCardBase';

interface TourCardProps {
  title: string;
  author: string;
  imageUrl: string;
  distance: string;
  duration: string;
  stops: number;
  rating: number;
  reviewCount: number;
  points: number;
  location?: string;
  modes?: string[];
  genre?: string;
  tourType?: string;
  onPress?: () => void;
  onEdit?: () => void;
  variant?: 'hero' | 'grid' | 'map';
}

export default function TourCard({
  title,
  author,
  imageUrl,
  distance,
  duration,
  stops,
  rating,
  reviewCount,
  points,
  location,
  modes = [],
  genre,
  tourType,
  onPress,
  onEdit,
  variant = 'hero',
}: TourCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const isGrid = variant === 'grid';
  const isMap = variant === 'map';

  // Map cards are shorter, Grid cards even shorter
  const cardHeight = isMap ? 220 : (isGrid ? 180 : 320);

  return (
    <TourCardBase imageUrl={imageUrl} height={cardHeight} onPress={onPress}>
      {/* Top Section */}
      <View style={styles.topRow}>
        {isGrid ? (
          <View style={[styles.ratingBadge, styles.blurBadge, { backgroundColor: 'rgba(255, 215, 0, 0.25)', borderColor: 'rgba(255, 215, 0, 0.4)' }]}>
            <BoltIconSolid size={10} color={theme.gold} />
            <TextComponent style={[styles.ratingText, { color: theme.gold, fontSize: 11 }]} bold>{points}</TextComponent>
          </View>
        ) : (
          <View style={styles.badgesContainer}>
            {genre && (
              <View style={[styles.badge, styles.blurBadge]}>
                {(() => {
                  const GenreIcon = getGenreIcon(genre);
                  return <GenreIcon size={12} color="#FFF" />;
                })()}
                <TextComponent style={styles.badgeText} variant="caption" bold>{t(genre.toLowerCase() as any) || genre}</TextComponent>
              </View>
            )}
            {tourType && (
              <View style={[styles.badge, styles.blurBadge]}>
                <TextComponent style={styles.badgeText} variant="caption" bold>{getTourTypeLabel(tourType)}</TextComponent>
              </View>
            )}
          </View>
        )}

        {/* If grid, push rating to right, if hero, it's already right */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: isGrid ? 'auto' : 0 }}>
          <View style={[styles.ratingBadge, styles.blurBadge]}>
            <StarIconSolid size={10} color={theme.gold} />
            <TextComponent style={styles.ratingText} variant="caption" bold>{rating.toFixed(1)}</TextComponent>
          </View>

          {onEdit && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation && e.stopPropagation();
                onEdit();
              }}
              style={[styles.ratingBadge, styles.blurBadge, { backgroundColor: theme.primary }]}
            >
              <Ionicons name="pencil" size={12} color="#FFF" />
              {!isGrid && <TextComponent style={styles.ratingText} variant="caption" bold>Edit</TextComponent>}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContent}>
        <View style={styles.titleContainer}>
          <TextComponent
            style={[styles.title, isGrid && styles.gridTitle]}
            variant={isGrid ? 'h3' : 'h2'}
            bold
            color="#FFF"
            numberOfLines={2}
          >
            {title}
          </TextComponent>
          {!isGrid && <TextComponent style={styles.author} variant="label" color='rgba(255, 255, 255, 0.9)'>{t('by')} {author}</TextComponent>}
        </View>

        {!isGrid && <View style={styles.separator} />}

        <View style={[styles.statsRow, isGrid && styles.gridStatsRow]}>
          {!isGrid ? (
            <View style={styles.statGroup}>
              <View style={styles.statItem}>
                <Ionicons name="location-sharp" size={12} color="#E0E0E0" />
                <TextComponent style={styles.statText} variant="caption" bold numberOfLines={1}>{distance}</TextComponent>
              </View>
              {location && (
                <>
                  <View style={styles.dotSeparator} />
                  <View style={styles.statItem}>
                    <MapIcon size={14} color="#E0E0E0" />
                    <TextComponent style={styles.statText} variant="caption" bold>{location}</TextComponent>
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.gridStatGroup}>
              <TextComponent style={styles.miniStatText} variant="caption" numberOfLines={1}>{distance}</TextComponent>
              {location && (
                <>
                  <TextComponent style={styles.miniStatText} variant="caption">•</TextComponent>
                  <TextComponent style={styles.miniStatText} variant="caption">{location}</TextComponent>
                </>
              )}
            </View>
          )}
        </View>

        {/* Absolute Points Indicator */}
        {!isGrid && (
          <View style={styles.pointsContainer}>
            <BoltIconSolid size={16} color={theme.gold} />
            <TextComponent style={[styles.pointsText, { color: theme.gold, fontSize: 14 }]} bold>
              {points}
            </TextComponent>
          </View>
        )}
      </View>
    </TourCardBase>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  blurBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    color: '#FFF',
    letterSpacing: 0.3,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    color: '#FFF',
  },
  bottomContent: {
    gap: 8,
  },
  titleContainer: {
    gap: 2,
  },
  title: {
    fontSize: 24, // Fallback/Basic
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gridTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  author: {
    // handled by component
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
    marginVertical: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#E0E0E0',
  },
  miniStatText: {
    color: '#E0E0E0',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  pointsContainer: {
    position: 'absolute',
    right: 0,
    bottom: -10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsText: {
    fontWeight: '800',
  },
  gridStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  gridStatGroup: {
    flexDirection: 'row',
    gap: 3,
    flex: 1, // Allow stats to take space
    flexWrap: 'wrap',
  },
});
