
import { StyleSheet, Text, View } from 'react-native';
import { BoltIcon as BoltIconSolid, ClockIcon, MapIcon, StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getGenreIcon } from '../../utils/genres';
import { getTourTypeLabel } from '../../utils/tourUtils';
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
  modes?: string[];
  genre?: string;
  tourType?: string;
  onPress?: () => void;
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
  modes = [],
  genre,
  tourType,
  onPress,
  variant = 'hero',
}: TourCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const isGrid = variant === 'grid';
  const isMap = variant === 'map';

  // Map cards are shorter, Grid cards even shorter
  const cardHeight = isMap ? 220 : (isGrid ? 240 : 320);

  return (
    <TourCardBase imageUrl={imageUrl} height={cardHeight} onPress={onPress}>
      {/* Top Section */}
      <View style={styles.topRow}>
        {!isGrid && (
          <View style={styles.badgesContainer}>
            {genre && (
              <View style={[styles.badge, styles.blurBadge]}>
                {(() => {
                  const GenreIcon = getGenreIcon(genre);
                  return <GenreIcon size={12} color="#FFF" />;
                })()}
                <Text style={styles.badgeText}>{genre}</Text>
              </View>
            )}
            {tourType && (
              <View style={[styles.badge, styles.blurBadge]}>
                <Text style={styles.badgeText}>{getTourTypeLabel(tourType)}</Text>
              </View>
            )}
          </View>
        )}

        {/* If grid, push rating to right, if hero, it's already right */}
        <View style={[styles.ratingBadge, styles.blurBadge, isGrid && { marginLeft: 'auto' }]}>
          <StarIconSolid size={10} color={theme.gold} />
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContent}>
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, isGrid && styles.gridTitle]}
            numberOfLines={2}
          >
            {title}
          </Text>
          {!isGrid && <Text style={styles.author}>{t('by')} {author}</Text>}
        </View>

        {!isGrid && <View style={styles.separator} />}

        <View style={[styles.statsRow, isGrid && styles.gridStatsRow]}>
          {!isGrid ? (
            <View style={styles.statGroup}>
              <View style={styles.statItem}>
                <MapIcon size={14} color="#E0E0E0" />
                <Text style={styles.statText}>{distance}</Text>
              </View>
              <View style={styles.dotSeparator} />
              <View style={styles.statItem}>
                <ClockIcon size={14} color="#E0E0E0" />
                <Text style={styles.statText}>{duration}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.gridStatGroup}>
              <Text style={styles.miniStatText}>{distance}</Text>
              <Text style={styles.miniStatText}>•</Text>
              <Text style={styles.miniStatText}>{duration}</Text>
            </View>
          )}

          <View style={[styles.pointsContainer, isGrid && styles.gridPointsContainer]}>
            <BoltIconSolid size={isGrid ? 10 : 16} color={theme.gold} />
            <Text style={[styles.pointsText, { color: theme.gold, fontSize: isGrid ? 11 : 14 }]}>{points}</Text>
          </View>
        </View>
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
    fontSize: 12,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '800',
  },
  bottomContent: {
    gap: 8,
  },
  titleContainer: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  gridTitle: {
    fontSize: 18, // Smaller for grid
    lineHeight: 22,
  },
  author: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
    fontSize: 13,
    fontWeight: '600',
  },
  miniStatText: {
    color: '#E0E0E0',
    fontSize: 12,
    fontWeight: '500',
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  pointsContainer: {
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
    fontSize: 14,
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
  gridPointsContainer: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 4, // Ensure spacing from stats
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    flexShrink: 0
  },
});
