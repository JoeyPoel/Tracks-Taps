import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TourSkeletonProps {
    variant?: 'hero' | 'grid';
}

export default function TourSkeleton({ variant = 'hero' }: TourSkeletonProps) {
    const { theme } = useTheme();
    const isGrid = variant === 'grid';
    const cardHeight = isGrid ? 240 : 320;

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary, height: cardHeight }]}>
            {/* Background image placeholder - slightly darker */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.bgSecondary }]} />

            {/* Main Shimmer Overlay for the whole card "feel" */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                {/* Top Section */}
                <View style={styles.topRow}>
                    <Shimmer width={isGrid ? 60 : 80} height={24} borderRadius={12} />
                    {isGrid && <Shimmer width={30} height={24} borderRadius={12} />}
                </View>

                {/* Bottom Content */}
                <View style={styles.bottomContent}>
                    {/* Title */}
                    <Shimmer width="85%" height={isGrid ? 22 : 28} borderRadius={6} style={{ marginBottom: 4 }} />
                    {!isGrid && <Shimmer width="40%" height={16} borderRadius={4} />}

                    {!isGrid && <View style={{ height: 12 }} />}

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <Shimmer width={isGrid ? 80 : 120} height={16} borderRadius={4} />
                        <Shimmer width={isGrid ? 30 : 50} height={20} borderRadius={10} />
                    </View>
                </View>
            </LinearGradient>

            {/* Subtle border to catch the eye */}
            <View style={[styles.border, { borderColor: theme.borderPrimary }]} />
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
    border: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        borderWidth: 1,
        opacity: 0.1,
    },
    shimmerContainer: {
        overflow: 'hidden',
        position: 'relative',
    },
    gradient: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 16,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    bottomContent: {
        width: '100%',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
});
