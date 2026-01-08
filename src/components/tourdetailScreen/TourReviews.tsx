import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from '../common/TextComponent'; // Added import

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
            <TextComponent style={{ fontSize: 12, fontWeight: '600' }} color={active ? '#FFF' : theme.textSecondary} variant="label">
                {label}
            </TextComponent>
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
                    <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h3">{t('reviews') || "Reviews"}</TextComponent>
                    <View style={styles.ratingRow}>
                        <TextComponent style={styles.averageRating} color={theme.textPrimary} bold variant="h1">
                            {averageRating ? averageRating.toFixed(1) : t('new')}
                        </TextComponent>
                        <View style={styles.starsRow}>
                            {renderStars(Math.round(averageRating || 0), 16)}
                        </View>
                        <TextComponent style={styles.reviewCount} color={theme.textSecondary} variant="label">
                            • {totalReviews}
                        </TextComponent>
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
                            <TextComponent style={styles.sortLabel} color={theme.textSecondary} variant="label">{t('sortBy')}:</TextComponent>
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
                                <Image source={{ uri: getOptimizedImageUrl(review.userAvatar, 40) }} style={styles.avatar} cachePolicy="disk" />
                                <View style={styles.userInfo}>
                                    <TextComponent style={styles.userName} color={theme.textPrimary} bold variant="body">
                                        {review.userName}
                                    </TextComponent>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <View style={styles.stars}>{renderStars(review.rating)}</View>
                                        <TextComponent style={styles.date} color={theme.textSecondary} variant="caption">
                                            {review.date}
                                        </TextComponent>
                                    </View>
                                </View>
                            </View>

                            <TextComponent style={styles.comment} color={theme.textPrimary} variant="body">
                                {review.comment}
                            </TextComponent>

                            {review.images && review.images.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                                    {review.images.map((img, index) => (
                                        <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => { /* Handle maximize? */ }}>
                                            <Image
                                                source={{ uri: getOptimizedImageUrl(img, 200) }}
                                                style={styles.reviewImage}
                                                contentFit="cover"
                                                cachePolicy="disk"
                                                transition={300}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    ))}

                    {/* Pagination Controls */}
                    {sortedReviews.length > visibleCount && (
                        <TouchableOpacity onPress={handleShowMore} style={styles.showMoreButton}>
                            <TextComponent style={styles.showMoreText} color={theme.primary} bold variant="label">{t('showMore')}</TextComponent>
                            <Ionicons name="chevron-down" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    )}

                    {visibleCount > 5 && sortedReviews.length > 5 && (
                        <TouchableOpacity onPress={handleShowLess} style={[styles.showMoreButton, { marginTop: 4 }]}>
                            <TextComponent style={styles.showMoreText} color={theme.textSecondary} size={13} variant="label">{t('showLess')}</TextComponent>
                        </TouchableOpacity>
                    )}

                    {reviews.length === 0 && (
                        <TextComponent style={{ textAlign: 'center', marginTop: 12 }} color={theme.textSecondary} variant="body">
                            {t('noReviewsYet')}
                        </TextComponent>
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
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    averageRating: {
        marginRight: 8,
    },
    starsRow: {
        flexDirection: 'row',
        marginRight: 8,
        gap: 2,
    },
    reviewCount: {
        // handled
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
        marginBottom: 2,
    },
    date: {
        // handled
    },
    stars: {
        flexDirection: 'row',
        gap: 1,
    },
    comment: {
        // handled
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 4,
    },
    sortLabel: {
        marginRight: 8,
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
        // handled
    },
    imagesContainer: {
        marginTop: 12,
        flexDirection: 'row',
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
    }
});
