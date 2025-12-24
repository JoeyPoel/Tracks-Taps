import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { ClockIcon, MapIcon, MapPinIcon } from 'react-native-heroicons/outline';
import { BoltIcon as BoltIconSolid, StarIcon as StarIconSolid } from 'react-native-heroicons/solid';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../common/AnimatedPressable';

import { getGenreIcon } from '../../utils/genres';

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
  difficulty?: string;
  onPress?: () => void;
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
  difficulty,
  onPress,
}: TourCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <AnimatedPressable onPress={onPress} style={[styles.card, { backgroundColor: theme.bgSecondary }]} interactionScale="subtle">
      <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground}>
        <LinearGradient
          colors={['transparent', theme.overlay]}
          style={styles.gradient}
        >
          <View style={styles.topRow}>
            {genre && (
              <View style={[styles.genreBadge, { backgroundColor: theme.bgSecondary }]}>
                {(() => {
                  const GenreIcon = getGenreIcon(genre);
                  return <GenreIcon size={14} color={theme.textPrimary} />;
                })()}
                <Text style={[styles.genreText, { color: theme.textPrimary }]}>{genre}</Text>
              </View>
            )}
          </View>

          <View style={styles.bottomRow}>
            {modes.length > 0 && (
              <View style={styles.modesContainer}>
                {modes.map((mode, index) => (
                  <View key={index} style={[styles.modeTag, { backgroundColor: theme.secondary }]}>
                    <Text style={[styles.modeText, { color: theme.textOnSecondary }]}>
                      {mode}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {difficulty && (
              <View style={[styles.difficultyBadge, { backgroundColor: theme.bgSecondary }]}>
                <Text style={[styles.difficultyText, { color: theme.textPrimary }]}>
                  {difficulty}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.author, { color: theme.textSecondary }]}>{t('by')} {author}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MapIcon size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{distance}</Text>
          </View>

          <View style={styles.statItem}>
            <ClockIcon size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{duration}</Text>
          </View>

          <View style={styles.statItem}>
            <MapPinIcon size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{stops} {t('stops')}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <StarIconSolid size={18} color={theme.starColor} />
            <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
              {rating.toFixed(1)}
            </Text>
            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
              ({reviewCount})
            </Text>
          </View>

          <View style={styles.pointsContainer}>
            <BoltIconSolid size={18} color={theme.primary} />
            <Text style={[styles.pointsText, { color: theme.primary }]}>{points} {t('pts')}</Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 12,
  },
  imageBackground: {
    height: 200,
    justifyContent: 'flex-end',
  },
  gradient: {
    height: '100%',
    justifyContent: 'space-between',
    padding: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  modeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 8,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    marginLeft: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  genreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4
  },
  genreText: {
    fontSize: 12,
    fontWeight: '700'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
});
