import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { lightTheme } from '@/src/theme/theme';

interface TourCardProps {
  title: string;
  progress: number; // 0 to 1
  progressText: string;
  onResume: () => void;
}

export default function ActiveTourCard({ title, progress, progressText, onResume }: TourCardProps) {
  const theme = lightTheme;

  return (
    <LinearGradient
      colors={[theme.fixedGradientTo, theme.fixedGradientFrom]}
      style={styles.gradientBorder}
    >
      <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>YOUR CURRENT ADVENTURE</Text>
        <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>

        {/* Progress Bar */}
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
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>{progressText}</Text>
        </View>

        {/* Map / Placeholder */}
        <View style={[styles.imageContainer, { backgroundColor: theme.bgTertiary }]}>
          <Ionicons name="image-outline" size={48} color={theme.iconMuted} />
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={onResume}>
          <Text style={styles.buttonText}>Resume Tour</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 12,
    padding: 2,
    margin: 16,
  },
  container: {
    borderRadius: 10,
    padding: 16,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  imageContainer: {
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
