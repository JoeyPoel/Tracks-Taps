import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface TourStatsProps {
    distance: string;
    duration: string;
    stops: number;
    points: number;
}

export default function TourStats({ distance, duration, stops, points }: TourStatsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const StatItem = ({ label, value }: { label: string; value: string | number }) => (
        <View style={[styles.statItem, { backgroundColor: theme.bgSecondary }]}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatItem
                label={t('distance')}
                value={distance}
            />
            <StatItem
                label={t('duration')}
                value={duration}
            />
            <StatItem
                label={t('stops')}
                value={stops}
            />
            <StatItem
                label={t('points')}
                value={points}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        gap: 8, // Use gap for creating space between items
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12, // Rounded corners
    },
    label: {
        fontSize: 12,
        marginBottom: 4,
        opacity: 0.8,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
