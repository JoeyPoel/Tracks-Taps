import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import TourButton from '../TourButton';

interface ActiveTourCardProps {
  title: string;
  progress: number;
  onResume: () => void;
}

export default function ActiveTourCard({ title, progress, onResume }: ActiveTourCardProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <LinearGradient
      colors={[theme.fixedGradientTo, theme.fixedGradientFrom]}
      style={styles.gradientBorder}
    >
      <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('currentAdventure')}
        </Text>

        <Text style={[styles.title, { color: theme.primary }]}>
          {title}
        </Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.bgTertiary }]}>
            {progress > 0 && (
              <LinearGradient
                colors={[theme.fixedGradientTo, theme.fixedGradientFrom]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    borderTopRightRadius: 3,
                    borderBottomRightRadius: 3,
                  },
                ]}
              />
            )}
          </View>

          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {progress * 100}% {t('completed')}
          </Text>
        </View>

        <View style={[styles.imageContainer, { backgroundColor: theme.bgTertiary }]}>
          <Ionicons name="image-outline" size={48} color={theme.iconMuted} />
        </View>

        <TourButton 
          onPress={onResume}
          buttonText={t('resumeTour')}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBorder: { borderRadius: 12, padding: 2 },
  container: { borderRadius: 10, padding: 16 },
  subtitle: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  progressContainer: { marginBottom: 12 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 },
  progressText: { fontSize: 12 },
  imageContainer: { height: 150, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontWeight: '700', fontSize: 16 },
});
