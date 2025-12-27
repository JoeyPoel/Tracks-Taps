import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

interface TourSkeletonProps {
    variant?: 'hero' | 'grid';
}

export default function TourSkeleton({ variant = 'hero' }: TourSkeletonProps) {
    const { theme } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const isGrid = variant === 'grid';
    const cardHeight = isGrid ? 240 : 320;

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, height: cardHeight }]}>
            <Animated.View style={[styles.imagePlaceholder, { backgroundColor: theme.borderPrimary }, animatedStyle]} />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                {/* Top Badges Placeholder */}
                <Animated.View style={[styles.badgePlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }, animatedStyle]} />

                {/* Bottom Content Placeholder */}
                <View style={styles.bottomContent}>
                    <Animated.View style={[styles.titlePlaceholder, { backgroundColor: 'rgba(255,255,255,0.3)' }, animatedStyle]} />
                    <Animated.View style={[styles.titlePlaceholder, { width: '60%', marginTop: 8, backgroundColor: 'rgba(255,255,255,0.3)' }, animatedStyle]} />

                    <View style={{ height: 16 }} />

                    <View style={styles.statsRow}>
                        <Animated.View style={[styles.statPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }, animatedStyle]} />
                        <Animated.View style={[styles.pointsPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }, animatedStyle]} />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        width: '100%',
        position: 'relative',
    },
    imagePlaceholder: {
        ...StyleSheet.absoluteFillObject,
    },
    gradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
    },
    badgePlaceholder: {
        width: 80,
        height: 24,
        borderRadius: 12,
    },
    bottomContent: {
        width: '100%',
    },
    titlePlaceholder: {
        height: 24,
        borderRadius: 4,
        width: '80%',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    statPlaceholder: {
        width: 100,
        height: 16,
        borderRadius: 8,
    },
    pointsPlaceholder: {
        width: 60,
        height: 24,
        borderRadius: 12,
    }
});
