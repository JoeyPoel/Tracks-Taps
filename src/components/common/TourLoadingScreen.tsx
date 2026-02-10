import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from './TextComponent';


interface TourLoadingScreenProps {
    message?: string;
    fullScreen?: boolean;
}

export const TourLoadingScreen: React.FC<TourLoadingScreenProps> = ({
    message = "Planning your adventure...",
    fullScreen = true
}) => {
    const { theme } = useTheme();

    // Animation Values
    const rotation = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        // 1. Compass Rotation (continuous spin/adjust)
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 8000,
                easing: Easing.linear
            }),
            -1
        );

        // 2. Pulse Effect
        scale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const compassStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }]
    }));

    const pulseRingStyle = useAnimatedStyle(() => {
        // Create a ripple expanding out
        const ringScale = interpolate(scale.value, [1, 1.1], [1, 1.8]); // Increased scale
        const ringOpacity = interpolate(scale.value, [1, 1.1], [0.5, 0]);
        return {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
        };
    });

    const OrbitDot = ({ index }: { index: number }) => {
        const style = useAnimatedStyle(() => {
            // Simulate orbiting dots
            const offset = index * (360 / 3);
            const currentDeg = (rotation.value + offset) % 360;
            const rad = currentDeg * (Math.PI / 180);
            const radius = 85; // Increased Orbit radius

            // Center is (0,0) relative to the dot's own position
            const translateX = radius * Math.cos(rad);
            const translateY = radius * Math.sin(rad);

            return {
                transform: [
                    { translateX: translateX },
                    { translateY: translateY }
                ],
                opacity: 0.8
            };
        });

        return (
            <Animated.View
                style={[
                    styles.orbitDot,
                    { backgroundColor: theme.secondary },
                    style
                ]}
            />
        );
    };

    const Container = fullScreen ? View : View;
    const containerStyle = fullScreen ? [styles.container, { backgroundColor: theme.bgPrimary }] : styles.embeddedContainer;

    return (
        <Container style={containerStyle}>
            <View style={styles.content}>
                {/* Outer Ring Pulse */}
                <Animated.View style={[styles.pulseRing, { borderColor: theme.primary }, pulseRingStyle]} />

                {/* Orbiting Dots */}
                {[0, 1, 2].map((i) => (
                    <OrbitDot key={i} index={i} />
                ))}

                {/* Central Compass/Icon */}
                <Animated.View style={[styles.iconContainer, compassStyle]}>
                    <LinearGradient
                        colors={[theme.primary, theme.secondary]}
                        style={styles.gradient}
                    >
                        <Ionicons name="compass" size={48} color={theme.fixedWhite} />
                    </LinearGradient>
                </Animated.View>

                {/* Message */}
                <View style={styles.textContainer}>
                    <TextComponent
                        variant="h3"
                        color={theme.textPrimary}
                        center
                        bold
                    >
                        {message}
                    </TextComponent>
                </View>
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100, // Visual adjustment to be vertically higher
        zIndex: 999
    },
    embeddedContainer: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: 300, // Increased from 200
        width: 300,  // Increased from 200 to give more orbit space
    },
    iconContainer: {
        position: 'absolute',
        top: 110,              // Center 80x80 in 300x300: (300-80)/2 = 110
        left: 110,
        width: 80,
        height: 80,
        borderRadius: 40,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
    },
    gradient: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        // Center the pulse ring
        top: 110,  // (300-80)/2 = 110
        left: 110,
    },
    orbitDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        // Start from center
        top: 144,  // (300-12)/2 = 144
        left: 144,
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
