import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

import { useAppWidth } from '@/src/hooks/useAppWidth';

const { height } = Dimensions.get('window');

const FloatingPoints = ({ 
  id,
  pointAmount, 
  label,
  onAnimationComplete 
}: { 
  id: string,
  pointAmount: number, 
  label?: string,
  onAnimationComplete: () => void 
}) => {
  const { theme } = useTheme();
  const appWidth = useAppWidth();

  // 1. Initial Values for Animation
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const randomPosition = React.useMemo(() => {
    // Simple hash function for deterministic random numbers based on ID
    const hash = (id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 1000;
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed + hash) * 10000;
      return x - Math.floor(x);
    };

    return {
      // X-Axis: Renders randomly between 20% and 80% of the screen width
      left: seededRandom(1) * (appWidth * 0.6) + (appWidth * 0.2),
      // Y-Axis: Renders randomly between 30% and 50% from the bottom
      bottom: seededRandom(2) * (height * 0.2) + (height * 0.3),
    };
  }, [id, appWidth]);

  useEffect(() => {
    console.log(`[FloatingPoints] Mounted! Amount: ${pointAmount}, Label: ${label || 'none'}`);
    
    // 3. Define the Animation
    Animated.parallel([
      // Move upwards
      Animated.timing(translateY, {
        toValue: -150, // Floats up by 150 pixels
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log(`[FloatingPoints] Animation complete for ${pointAmount}`);
      // 4. Callback when animation finishes
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [pointAmount, label]);

  const renderRainbowLabel = (text: string) => {
    // Vibrant rainbow-ish colors
    const colors = ['#FF2D55', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#AF52DE'];
    return (
      <Text style={[styles.labelText, { textShadowColor: theme.shadowColor }]}>
        {text.split('').map((char, i) => (
          <Text key={i} style={{ color: colors[i % colors.length] }}>
            {char}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: randomPosition.left,
          bottom: randomPosition.bottom,
          opacity: opacity,
          transform: [
            { translateY: translateY },
            // This centers the text on the random point so it doesn't overflow if close to the edge
            { translateX: -50 }
          ],
        },
      ]}
      pointerEvents="none"
    >
      {label && (
        label.toUpperCase().includes('BINGO') ? (
          renderRainbowLabel(label)
        ) : (
          <Text style={[styles.labelText, { color: theme.accent, textShadowColor: theme.shadowColor }]}>
            {label}
          </Text>
        )
      )}
      <Text style={[styles.text, { textShadowColor: theme.shadowColor }]}>+{pointAmount}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 120, // Match text width for centering
    zIndex: 999999, // High z-index just in case
  },
  text: {
    color: '#FFD700',
    fontSize: 40,
    fontWeight: 'bold',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: 'center',
    width: 120, // Fixed width helps the centering logic work consistently
  },
  labelText: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: -4,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 8,
  }
});

export default FloatingPoints;