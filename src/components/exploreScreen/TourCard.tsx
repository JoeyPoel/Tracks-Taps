import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
  difficulty?: string;
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
  difficulty,
}: TourCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
      <ImageBackground source={{ uri: imageUrl }} style={styles.imageBackground}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          {difficulty && (
            <View style={[styles.difficultyBadge, { backgroundColor: theme.bgSecondary }]}>
              <Text style={[styles.difficultyText, { color: theme.textPrimary }]}>
                {difficulty}
              </Text>
            </View>
          )}

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
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.author, { color: theme.textSecondary }]}>by {author}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="navigate-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{distance}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{duration}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>{stops} stops</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color={theme.starColor} />
            <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
              {rating.toFixed(1)}
            </Text>
            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
              ({reviewCount})
            </Text>
          </View>

          <View style={styles.pointsContainer}>
            <Ionicons name="flash" size={18} color={theme.primary} />
            <Text style={[styles.pointsText, { color: theme.primary }]}>{points} pts</Text>
          </View>
        </View>
      </View>
    </View>
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
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
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
});

