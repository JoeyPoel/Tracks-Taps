import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Shimmer } from '../common/Shimmer';

export default function SavedTripSkeleton() {
    const { theme } = useTheme();

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
            {/* Image Area */}
            <View style={styles.imageContainer}>
                <Shimmer width="100%" height="100%" />
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                <View style={{ flex: 1, marginRight: 12 }}>
                    <Shimmer width="60%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
                    <Shimmer width="30%" height={14} borderRadius={4} />
                </View>
                <Shimmer width={36} height={36} borderRadius={18} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
    },
    imageContainer: {
        height: 160,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    content: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    }
});
