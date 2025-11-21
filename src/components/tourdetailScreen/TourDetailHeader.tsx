import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '@/src/theme/theme';

interface TourDetailHeaderProps {
  title: string;
  location: string;
  author: string;
  rating: number;
  reviews: number;
  description: string;
  onStartTour: () => void;
}

export default function TourDetailHeader({
  title,
  location,
  author,
  rating,
  reviews,
  description,
  onStartTour,
}: TourDetailHeaderProps) {
  const theme = lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={theme.iconSecondary} />
        <Text style={[styles.location, { color: theme.textSecondary }]}>{location}</Text>
        <Text style={[styles.by, { color: theme.textSecondary }]}> by {author}</Text>
      </View>

      <View style={styles.row}>
        {Array.from({ length: Math.floor(rating) }).map((_, i) => (
          <Ionicons key={i} name="star" size={16} color={theme.starColor} />
        ))}
        {rating % 1 >= 0.5 && <Ionicons name="star-half" size={16} color={theme.starColor} />}
        <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
          ({reviews} reviews)
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.textPrimary }]}>{description}</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={onStartTour}>
        <Text style={styles.buttonText}>Start Tour!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  location: { marginLeft: 4, fontSize: 14 },
  by: { marginLeft: 4, fontSize: 14, fontWeight: '500' },
  reviewCount: { marginLeft: 6, fontSize: 14 },
  description: { fontSize: 14, marginVertical: 12 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
