import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';

export default function AchievementsSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            {/* Header Shimmer */}
            <View style={styles.header}>
                <Shimmer width={40} height={40} borderRadius={20} />
                <Shimmer width={150} height={24} borderRadius={12} />
                <View style={{ width: 40 }} />
            </View>

            {/* Progress Card Shimmer */}
            <View style={[styles.progressCard, { backgroundColor: theme.bgSecondary }]}>
                <View style={styles.progressRow}>
                    <View style={{ gap: 8 }}>
                        <Shimmer width={100} height={16} borderRadius={4} />
                        <Shimmer width={140} height={32} borderRadius={8} />
                    </View>
                    <Shimmer width={48} height={48} borderRadius={24} />
                </View>
                <Shimmer width="100%" height={8} borderRadius={4} style={{ marginTop: 16 }} />
            </View>

            {/* Grid Shimmer */}
            <View style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <View key={i} style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
                        <Shimmer width={64} height={64} borderRadius={32} style={{ marginBottom: 12 }} />
                        <Shimmer width={80} height={14} borderRadius={4} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
    },
    progressCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        overflow: 'hidden',
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
