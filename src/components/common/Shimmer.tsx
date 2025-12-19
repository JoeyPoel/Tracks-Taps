import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleProp, StyleSheet, View, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface ShimmerProps {
    /**
     * Width of the shimmer block.
     */
    width?: DimensionValue;

    /**
     * Height of the shimmer block.
     */
    height?: DimensionValue;

    /**
     * Border radius for the shimmer block.
     */
    borderRadius?: number;

    /**
     * Container style.
     */
    style?: StyleProp<ViewStyle>;

    /**
     * Base color of the skeleton (e.g., #E0E0E0).
     */
    baseColor?: string;

    /**
     * Highlight color of the shimmer (e.g., #F5F5F5).
     */
    highlightColor?: string;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * A reusable Shimmer component for loading states (Skeleton UI).
 */
export const Shimmer: React.FC<ShimmerProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
    baseColor = '#E1E9EE',
    highlightColor = '#F2F8FC',
}) => {
    const translateX = useSharedValue(-100);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(100, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1, // Infinite loop
            false // No reverse
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        // Determine the translation distance based on screen width or specific width
        // Simply translating from -100% to 100% of the component's width is usually sufficient
        return {
            transform: [{ translateX: interpolate(translateX.value, [-100, 100], [-300, 300]) }], // Rough estimation for movement
        };
    });

    return (
        <View
            style={[
                styles.container,
                { width, height, borderRadius, backgroundColor: baseColor, overflow: 'hidden' },
                style,
            ]}
        >
            <AnimatedLinearGradient
                colors={[baseColor, highlightColor, baseColor]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFill, animatedStyle]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // Base layout
    },
});
