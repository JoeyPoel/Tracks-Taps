import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShimmerProps {
    style?: any;
    width?: number | string;
    height?: number;
    borderRadius?: number;
}

export const Shimmer = ({ style, width, height, borderRadius }: ShimmerProps) => {
    const { theme } = useTheme();
    const translateX = useSharedValue(-SCREEN_WIDTH);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(SCREEN_WIDTH, {
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            false
        );
    }, []);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    return (
        <View style={[styles.shimmerContainer, { width, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.05)' }, style]}>
            <Animated.View style={[StyleSheet.absoluteFill, rStyle]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    shimmerContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
});
