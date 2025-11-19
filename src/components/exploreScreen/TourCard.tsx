import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '@/src/theme/theme';

interface TourCardProps {
    title: string;
    location: string;
    description: string;
    stops: number;
    rating: number;
    theme?: typeof lightTheme;
}

export default function TourCard({
    title,
    location,
    description,
    stops,
    rating,
    theme = lightTheme,
}: TourCardProps) {
    const fullStars: number = Math.floor(rating);
    const halfStar: number = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars: number = 5 - fullStars - halfStar;

    return (
        <View style={[styles.card, { backgroundColor: theme.bgSecondary }]}>
            <View style={[styles.imageContainer, { backgroundColor: theme.bgTertiary }]}>
                <Ionicons name="image-outline" size={48} color={theme.iconMuted} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>

                <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.location, { color: theme.textSecondary }]}>{location}</Text>
                </View>

                <Text style={[styles.description, { color: theme.textPrimary }]}>{description}</Text>

                <View style={styles.footer}>
                    <Text style={[styles.stops, { color: theme.textPrimary }]}>{stops} Stops</Text>

                    <View style={styles.ratingRow}>
                        {Array.from({ length: fullStars }, (_, i) => (
                            <Ionicons
                                key={`full-${i}`}
                                name="star"
                                size={14}
                                color={theme.starColor}
                            />
                        ))}
                        {halfStar === 1 && (
                            <Ionicons name="star-half" size={14} color={theme.starColor} />
                        )}
                        {Array.from({ length: emptyStars }, (_, i) => (
                            <Ionicons
                                key={`empty-${i}`}
                                name="star-outline"
                                size={14}
                                color={theme.starColor}
                            />
                        ))}
                        <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
                            ({rating.toFixed(1)})
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        marginVertical: 12,
    },
    imageContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    location: {
        marginLeft: 4,
        fontSize: 14,
    },
    description: {
        fontSize: 14,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stops: {
        fontSize: 14,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewCount: {
        marginLeft: 4,
        fontSize: 13,
    },
});
