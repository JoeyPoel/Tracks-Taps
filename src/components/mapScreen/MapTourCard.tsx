import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getGenreIcon } from '../../utils/genres';
import { AnimatedPressable } from '../common/AnimatedPressable';

interface MapTourCardProps {
    title: string;
    author: string;
    distance: string;
    duration: string;
    stops: number;
    rating: number;
    reviewCount: number;
    points: number;
    genre: string; // Add genre
    onPress?: () => void;
}

export default function MapTourCard({
    title,
    author,
    distance,
    duration,
    stops,
    rating,
    reviewCount,
    points,
    genre, // Destructure genre
    onPress,
}: MapTourCardProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const GenreIcon = getGenreIcon(genre) || Ionicons; // Fallback?

    return (
        <AnimatedPressable onPress={onPress} style={{ width: '100%' }} interactionScale="medium" haptic="light">
            <View style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>{title}</Text>
                            <Text style={[styles.author, { color: theme.textSecondary }]}>{t('by')} {author}</Text>
                        </View>
                        {/* Genre Icon/Badge */}
                        <View style={[styles.genreBadge, { backgroundColor: theme.bgTertiary }]}>
                            <GenreIcon size={16} color={theme.textPrimary} />
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="navigate-outline" size={16} color={theme.textSecondary} />
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>{distance}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>{duration}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                            <Text style={[styles.statText, { color: theme.textSecondary }]}>{stops} {t('stops')}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={18} color={theme.starColor} />
                            <Text style={[styles.ratingText, { color: theme.textPrimary }]}>
                                {rating.toFixed(1)}
                            </Text>
                            <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
                                ({reviewCount})
                            </Text>
                        </View>

                        <View style={styles.pointsContainer}>
                            <Ionicons name="flash" size={18} color={theme.primary} />
                            <Text style={[styles.pointsText, { color: theme.primary }]}>{points} {t('pts')}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        paddingRight: 8,
    },
    author: {
        fontSize: 14,
        marginBottom: 12,
    },
    genreBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    statText: {
        fontSize: 14,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 14,
        marginLeft: 4,
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pointsText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
});
