import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
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
  const translateX = useRef(new Animated.Value(0)).current; // Added for waving
  const scale = useRef(new Animated.Value(0.5)).current; // Start small for pulse/pop

  const randomPosition = useMemo(() => {
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
      // 3.1 Smooth Scale Entry
      Animated.timing(scale, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      // 3.2 Move upwards
      Animated.timing(translateY, {
        toValue: -180, 
        duration: 2500, 
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 3.3 Horizontal "Wave" (only at the beginning)
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 15,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -8,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 8,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // 3.4 Fade out (starts later)
      Animated.sequence([
        Animated.delay(1800),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
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
            { translateX: translateX }, // Apply waving translateX
            { scale: scale }, // Applied pop/pulse scale
            // This centers the text on the random point so it doesn't overflow if close to the edge
            // Combined with translateX waving
            { translateX: -50 } 
          ],
        },
      ]}
      pointerEvents="none"
    >
      {label && (
        label.toUpperCase().includes('BINGO') ? (
          <View style={{ flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'center', width: 400, marginLeft: -140 }}>
            {renderRainbowLabel(label)}
          </View>
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
    fontSize: 52, // MASSIVELY increased for "BINGO!" impact
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: -8,
    textTransform: 'uppercase',
    letterSpacing: 4, // Wider spacing for modern premium look
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 12,
  }
});

export default FloatingPoints;