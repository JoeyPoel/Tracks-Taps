import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TourStatsProps {
    distance: string;
    duration: string;
    stops: number;
    points: number;
}

export default function TourStats({ distance, duration, stops, points }: TourStatsProps) {
    const { theme } = useTheme();

    const StatItem = ({ label, value }: { label: string; value: string | number }) => (
        <View style={[styles.statItem, { backgroundColor: theme.bgSecondary }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatItem label="Distance" value={distance} />
            <StatItem label="Duration" value={duration} />
            <StatItem label="Stops" value={stops} />
            <StatItem label="Points" value={points} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 8,
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
