import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Dimensions, View, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = [
  '#FFC107', '#2196F3', '#E91E63', '#4CAF50', '#9C27B0', '#F44336', '#00BCD4'
];

const NUM_CONFETTI = 60;

const ConfettiPiece = () => {
  // 1. Setup Animation Values
  // Start at -100 (just above screen)
  const animatedY = useRef(new Animated.Value(-100)).current; 
  const animatedRotate = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current; 

  // 2. Randomize Properties
  const [props] = useState(() => {
    // Duration: 4000ms to 7000ms (4s - 7s)
    // This is the "middle ground" speed you requested
    const duration = 4000 + Math.random() * 3000; 
    
    return {
      left: Math.random() * width,
      backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 8 + Math.random() * 6,
      duration: duration,
      delay: Math.random() * 2000,
      rotateOutput: Math.random() > 0.5 ? '360deg' : '-360deg',
    };
  });

  useEffect(() => {
    Animated.parallel([
      // A. Falling Animation
      Animated.sequence([
        Animated.delay(props.delay),
        Animated.timing(animatedY, {
          toValue: height + 50, 
          duration: props.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),

      // B. Spinning Animation
      Animated.sequence([
        Animated.delay(props.delay),
        Animated.timing(animatedRotate, {
          toValue: 1,
          duration: props.duration,
          useNativeDriver: true,
        }),
      ]),

      // C. Fade Out Animation
      Animated.sequence([
        Animated.delay(props.delay),
        // Stay fully visible for 70% of the fall
        Animated.delay(props.duration * 0.7), 
        // Fade out smoothly during the last 30%
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: props.duration * 0.3,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const spin = animatedRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', props.rotateOutput],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0, 
        left: props.left,
        width: props.size,
        height: props.size * 1.5,
        backgroundColor: props.backgroundColor,
        opacity: animatedOpacity, 
        transform: [
          { translateY: animatedY },
          { rotate: spin },
          { rotateX: spin },
        ],
      }}
    />
  );
};

const Confetti = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {[...Array(NUM_CONFETTI)].map((_, index) => (
        <ConfettiPiece key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    elevation: 999,
  },
});

export default Confetti;