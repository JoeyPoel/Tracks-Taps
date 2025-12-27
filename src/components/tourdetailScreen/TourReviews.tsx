import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    date: string;
    comment: string;
    images?: string[];
}

interface TourReviewsProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
}

export default function TourReviews({ reviews, averageRating, totalReviews }: TourReviewsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [expanded, setExpanded] = useState(false);

    // sorting and pagination
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
    const [visibleCount, setVisibleCount] = useState(5);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const sortedReviews = React.useMemo(() => {
        const sorted = [...reviews];
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);
            default:
                return sorted;
        }
    }, [reviews, sortBy]);

    const visibleReviews = sortedReviews.slice(0, visibleCount);

    const handleShowMore = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVisibleCount(prev => prev + 5);
    };

    const handleShowLess = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVisibleCount(5);
    };

    const SortChip = ({ label, value, active }: any) => (
        <TouchableOpacity
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSortBy(value);
                setVisibleCount(5); // Reset pagination on sort change
            }}
            style={[
                styles.sortChip,
                {
                    backgroundColor: active ? theme.primary : theme.bgSecondary,
                    borderWidth: 1,
                    borderColor: active ? theme.primary : theme.borderPrimary
                }
            ]}
        >
            <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: active ? '#FFF' : theme.textSecondary
            }}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderStars = (rating: number, size = 14) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={size}
                color={index < rating ? "#FFD700" : theme.textSecondary + '40'}
            />
        ));
    };

    return (
        <View style={styles.container}>

            {/* Summary Header (Always Visible) */}
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpanded}
                style={[styles.headerCard, { backgroundColor: theme.bgSecondary }]}
            >
                <View>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>{t('reviews') || "Reviews"}</Text>
                    <View style={styles.ratingRow}>
                        <Text style={[styles.averageRating, { color: theme.textPrimary }]}>
                            {averageRating ? averageRating.toFixed(1) : "New"}
                        </Text>
                        <View style={styles.starsRow}>
                            {renderStars(Math.round(averageRating || 0), 16)}
                        </View>
                        <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
                            • {totalReviews}
                        </Text>
                    </View>
                </View>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={theme.textSecondary}
                />
            </TouchableOpacity>

            {/* Expandable List */}
            {expanded && (
                <View style={styles.listContainer}>

                    {/* Sorting Controls */}
                    {reviews.length > 0 && (
                        <View style={styles.sortContainer}>
                            <Text style={[styles.sortLabel, { color: theme.textSecondary }]}>{t('sortBy')}:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                <SortChip label={t('newest')} value="newest" active={sortBy === 'newest'} />
                                <SortChip label={t('highestRating')} value="highest" active={sortBy === 'highest'} />
                                <SortChip label={t('lowestRating')} value="lowest" active={sortBy === 'lowest'} />
                            </ScrollView>
                        </View>
                    )}

                    {visibleReviews.map((review) => (
                        <View
                            key={review.id}
                            style={[styles.reviewCard, { backgroundColor: theme.bgSecondary }]}
                        >
                            <View style={styles.reviewHeader}>
                                <Image source={{ uri: review.userAvatar }} style={styles.avatar} />
                                <View style={styles.userInfo}>
                                    <Text style={[styles.userName, { color: theme.textPrimary }]}>
                                        {review.userName}
                                    </Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={styles.stars}>{renderStars(review.rating)}</View>
                                        <Text style={[styles.date, { color: theme.textSecondary }]}>
                                            {review.date}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={[styles.comment, { color: theme.textPrimary }]}>
                                {review.comment}
                            </Text>
                        </View>
                    ))}

                    {/* Pagination Controls */}
                    {sortedReviews.length > visibleCount && (
                        <TouchableOpacity onPress={handleShowMore} style={styles.showMoreButton}>
                            <Text style={[styles.showMoreText, { color: theme.primary }]}>{t('showMore')}</Text>
                            <Ionicons name="chevron-down" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    )}

                    {visibleCount > 5 && sortedReviews.length > 5 && (
                        <TouchableOpacity onPress={handleShowLess} style={[styles.showMoreButton, { marginTop: 4 }]}>
                            <Text style={[styles.showMoreText, { color: theme.textSecondary, fontSize: 13 }]}>{t('showLess')}</Text>
                        </TouchableOpacity>
                    )}

                    {reviews.length === 0 && (
                        <Text style={{ textAlign: 'center', color: theme.textSecondary, marginTop: 12 }}>
                            No reviews yet.
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    headerCard: {
        padding: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Soft Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    averageRating: {
        fontSize: 24,
        fontWeight: 'bold',
        marginRight: 8,
    },
    starsRow: {
        flexDirection: 'row',
        marginRight: 8,
        gap: 2,
    },
    reviewCount: {
        fontSize: 14,
    },
    listContainer: {
        marginTop: 16,
        gap: 12,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
    },
    stars: {
        flexDirection: 'row',
        gap: 1,
    },
    comment: {
        fontSize: 14,
        lineHeight: 22,
        opacity: 0.9,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 4,
    },
    sortLabel: {
        fontSize: 12,
        marginRight: 8,
        fontWeight: '600',
    },
    sortChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    showMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    showMoreText: {
        fontWeight: '600',
        fontSize: 14,
    }
});
