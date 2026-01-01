import { TextComponent } from '@/src/components/common/TextComponent'; // Added import
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedButton } from '../common/AnimatedButton';

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
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <TextComponent style={styles.title} color={theme.primary} bold variant="h2">{title}</TextComponent>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={theme.iconSecondary} />
        <TextComponent style={styles.location} color={theme.textSecondary} variant="caption">{location}</TextComponent>
        <TextComponent style={styles.by} color={theme.textSecondary} variant="caption">
          {t('by')} {author}
        </TextComponent>
      </View>

      <View style={styles.row}>
        {Array.from({ length: Math.floor(rating) }).map((_, i) => (
          <Ionicons key={i} name="star" size={16} color={theme.starColor} />
        ))}
        {rating % 1 >= 0.5 && <Ionicons name="star-half" size={16} color={theme.starColor} />}
        <TextComponent style={styles.reviewCount} color={theme.textSecondary} variant="caption">
          ({reviews} {t('reviews')})
        </TextComponent>
      </View>

      <TextComponent style={styles.description} color={theme.textPrimary} variant="body">{description}</TextComponent>

      <AnimatedButton
        title={t('startTour')}
        onPress={onStartTour}
        variant="primary"
        style={styles.button}
      />
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
  buttonText: { fontWeight: '700', fontSize: 16 },
});
