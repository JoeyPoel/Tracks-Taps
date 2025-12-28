import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

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
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onResume}
      style={[styles.container, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
    >
      <ImageBackground
        source={imageUrl ? { uri: imageUrl } : undefined}
        style={styles.backgroundImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradientOverlay}
        >
          <View style={styles.content}>
            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Ionicons name="play" size={12} color="#FFF" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>{t('inProgressBadge')}</Text>
            </View>

            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>

            <View style={styles.progressRow}>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
              </View>
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        {!imageUrl && (
          <View style={[styles.placeholderContainer, { backgroundColor: theme.bgTertiary }]}>
            <Ionicons name="map-outline" size={48} color={theme.iconMuted} />
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 16,
    // Soft Shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
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
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
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
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  }
});
