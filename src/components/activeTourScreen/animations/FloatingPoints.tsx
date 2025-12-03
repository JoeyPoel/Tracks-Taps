import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const FloatingPoints = ({ pointAmount, onAnimationComplete }: { pointAmount: number, onAnimationComplete: () => void }) => {
  // 1. Initial Values for Animation
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 2. Generate Random Position (Only once on mount)
  const randomPosition = useRef({
    // X-Axis: Renders randomly between 20% and 80% of the screen width
    // Formula: Math.random() * (span) + (start_offset)
    left: Math.random() * (width * 0.6) + (width * 0.2), 
    
    // Y-Axis: Renders randomly between 30% and 50% from the bottom (Middle-Lower)
    bottom: Math.random() * (height * 0.2) + (height * 0.3),
  }).current;

  useEffect(() => {
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
      // 4. Callback when animation finishes
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [pointAmount]);

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
      <Text style={styles.text}>+{pointAmount}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  text: {
    color: '#FFD700',
    fontSize: 40,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: 'center',
    width: 100, // Fixed width helps the centering logic work consistently
  },
});

export default FloatingPoints;