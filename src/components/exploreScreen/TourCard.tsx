import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TourCardProps {
  title: string;
  location: string;
  description: string;
  stops: number;
  rating: number;
}

export default function TourCard({
  title,
  location,
  description,
  stops,
  rating,
}: TourCardProps) {
  const { theme } = useTheme();

  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <View style={[styles.card, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
      <View style={[styles.imageContainer, { backgroundColor: theme.bgTertiary }]}>
        <Ionicons name="image-outline" size={48} color={theme.iconMuted} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.location, { color: theme.textSecondary }]}>
            {location}
          </Text>
        </View>

        <Text style={[styles.description, { color: theme.textPrimary }]}>{description}</Text>

        <View style={styles.footer}>
          <Text style={[styles.stops, { color: theme.textPrimary }]}>{stops} Stops</Text>

          <View style={styles.ratingRow}>
            {Array.from({ length: fullStars }, (_, i) => (
              <Ionicons key={`full-${i}`} name="star" size={14} color={theme.starColor} />
            ))}

            {halfStar === 1 && (
              <Ionicons name="star-half" size={14} color={theme.starColor} />
            )}

            {Array.from({ length: emptyStars }, (_, i) => (
              <Ionicons key={`empty-${i}`} name="star-outline" size={14} color={theme.starColor} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', marginVertical: 12, borderWidth: 1 },
  imageContainer: { height: 120, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  location: { marginLeft: 4, fontSize: 14 },
  description: { fontSize: 14, marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stops: { fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
});
