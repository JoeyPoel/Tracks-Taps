import { Ionicons } from '@expo/vector-icons';
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

    const StatItem = ({ label, value, icon, iconColor }: { label: string; value: string | number; icon: keyof typeof Ionicons.glyphMap; iconColor: string }) => (
        <View style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
            <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatItem
                label={t('distance')}
                value={distance}
                icon="location-outline"
                iconColor={theme.secondary}
            />
            <StatItem
                label={t('duration')}
                value={duration}
                icon="time-outline"
                iconColor={theme.success}
            />
            <StatItem
                label={t('stops')}
                value={stops}
                icon="trending-up-outline"
                iconColor={theme.danger}
            />
            <StatItem
                label={t('points')}
                value={points}
                icon="flash-outline"
                iconColor={theme.accent}
            />
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
        marginHorizontal: 4,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
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
