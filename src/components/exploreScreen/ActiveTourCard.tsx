import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from '../common/TextComponent'; // Added import
import { TourCardBase } from './TourCardBase';

interface ActiveTourCardProps {
  title: string;
  imageUrl: string;
  progress: number;
  onResume: () => void;
}

export default function ActiveTourCard({ title, imageUrl, progress, onResume }: ActiveTourCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <TourCardBase imageUrl={imageUrl} height={200} onPress={onResume}>
      <View />
      <View style={styles.content}>
        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: theme.primary }]}>
          <Ionicons name="play" size={12} color="#FFF" style={{ marginRight: 4 }} />
          <TextComponent style={styles.badgeText} variant="caption" bold color="#FFF">
            {t('inProgressBadge')}
          </TextComponent>
        </View>

        <TextComponent style={styles.title} variant="h3" color="#FFF" bold numberOfLines={2}>
          {title}
        </TextComponent>

        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
          </View>
          <TextComponent style={styles.progressText} variant="label" bold color="#FFF">
            {Math.round(progress * 100)}%
          </TextComponent>
        </View>
      </View>
    </TourCardBase>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    marginBottom: 8,
  },
  badgeText: {
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
  }
});
