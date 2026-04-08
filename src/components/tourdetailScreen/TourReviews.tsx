import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, TouchableOpacity, UIManager, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from '../common/TextComponent';
import { useTranslation } from '../../context/TranslationContext';
import { FadeInItem } from '../common/FadeInList';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Review {
    id: string;
    userId: string;
    name: string;
    userAvatar: string;
    rating: number;
    date: string;
    createdAt: string | Date;
    comment: string;
    images?: string[];
}

interface TourReviewsProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    sortBy: 'newest' | 'oldest' | 'highest' | 'lowest';
    onSortChange: (sort: 'newest' | 'oldest' | 'highest' | 'lowest') => void;
    onWriteReview?: () => void;
    onEditReview?: (review: Review) => void;
    onDeleteReview?: (reviewId: string) => void;
    currentUserId?: string | number;
}

import { ImageLightbox } from '../common/ImageLightbox';

function ReviewItem({ 
    review, 
    index, 
    currentUserId, 
    onEditReview, 
    onDeleteReview, 
    handleOpenLightbox,
    renderStars
}: { 
    review: Review, 
    index: number, 
    currentUserId?: string | number,
    onEditReview?: (review: Review) => void,
    onDeleteReview?: (reviewId: string) => void,
    handleOpenLightbox: (images: string[], index: number) => void,
    renderStars: (rating: number) => React.ReactNode
}) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const { translateText, requireTranslation, isAutoTranslateEnabled } = useTranslation();
    const [isTranslated, setIsTranslated] = useState(isAutoTranslateEnabled);

    const toggleTranslation = async () => {
        if (!isTranslated) {
            // If we're turning it ON, ensure we have the translation
            await requireTranslation(review.comment);
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsTranslated(!isTranslated);
    };

    return (
        <FadeInItem index={index}>
            <View style={[styles.reviewCard, { backgroundColor: theme.bgSecondary, overflow: 'hidden' }]}>
                <TouchableOpacity
                    activeOpacity={0.4}
                    style={styles.reviewHeader}
                    onPress={() => {
                        if (review.userId && review.userId !== 'unknown') {
                            router.push({
                                pathname: '/(tabs)/profile/friend-profile',
                                params: { userId: review.userId }
                            });
                        }
                    }}
                >
                    <Image
                        source={review.userAvatar ? { uri: getOptimizedImageUrl(review.userAvatar, 40) } : require('../../../assets/images/profilePictureFallback.png')}
                        style={[styles.avatar, { backgroundColor: theme.bgPrimary }]}
                        cachePolicy="disk"
                        contentFit="cover"
                    />
                    <View style={styles.userInfo}>
                        <TextComponent style={styles.name} color={theme.textPrimary} bold variant="body">
                            {review.name}
                        </TextComponent>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={styles.stars}>{renderStars(review.rating)}</View>
                            <TextComponent style={styles.date} color={theme.textSecondary} variant="caption">
                                {review.date}
                            </TextComponent>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Author Actions (Edit/Delete) */}
                {currentUserId != null && String(review.userId) === String(currentUserId) && (
                    <View style={styles.authorActions}>
                        <TouchableOpacity 
                            onPress={() => onEditReview?.(review)}
                            style={[styles.actionIcon, { backgroundColor: theme.primary + '15' }]}
                        >
                            <Ionicons name="pencil" size={14} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => onDeleteReview?.(review.id)}
                            style={[styles.actionIcon, { backgroundColor: theme.danger + '15' }]}
                        >
                            <Ionicons name="trash-outline" size={14} color={theme.danger} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <TextComponent style={styles.comment} color={theme.textPrimary} variant="body">
                            {isTranslated ? translateText(review.comment, true) : review.comment}
                        </TextComponent>
                    </View>
                    
                    {review.comment && review.comment.trim().length > 0 && (
                        <TouchableOpacity 
                            onPress={toggleTranslation}
                            style={[styles.translateToggle, { backgroundColor: isTranslated ? theme.primary + '15' : 'transparent' }]}
                        >
                            <Ionicons 
                                name="language" 
                                size={16} 
                                color={isTranslated ? theme.primary : theme.textSecondary} 
                            />
                            <TextComponent 
                                size={10} 
                                color={isTranslated ? theme.primary : theme.textSecondary}
                                bold={isTranslated}
                            >
                            </TextComponent>
                        </TouchableOpacity>
                    )}
                </View>

                {
                    review.images && review.images.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                            {review.images.map((img, index) => (
                                <TouchableOpacity key={index} activeOpacity={0.9} onPress={() => handleOpenLightbox(review.images!, index)}>
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
                    )
                }
            </View>
        </FadeInItem>
    );
}

export default function TourReviews({ 
    reviews, 
    averageRating, 
    totalReviews, 
    sortBy, 
    onSortChange, 
    onWriteReview,
    onEditReview,
    onDeleteReview,
    currentUserId
}: TourReviewsProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { translateText, requireTranslation, isAutoTranslateEnabled } = useTranslation();
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);

    // Lightbox state
    const [lightboxImages, setLightboxImages] = useState<string[]>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [lightboxVisible, setLightboxVisible] = useState(false);

    // pagination (sorting is now lifted)
    const [visibleCount, setVisibleCount] = useState(5);

    const SortChip = ({ label, value, active }: any) => (
        <TouchableOpacity
            onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                onSortChange(value);
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

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handleOpenLightbox = (images: string[], index: number) => {
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxVisible(true);
    };
    
    // Reviews are now pre-sorted by the backend/hook
    const visibleReviews = reviews.slice(0, visibleCount);

    const handleShowMore = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVisibleCount(prev => prev + 5);
    };

    const handleShowLess = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVisibleCount(5);
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
                    {/* Write Review Trigger */}
                    {onWriteReview && (
                        <TouchableOpacity
                            onPress={onWriteReview}
                            style={[styles.writeReviewButton, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}
                        >
                            <Ionicons name="create-outline" size={20} color={theme.primary} />
                            <TextComponent style={styles.writeReviewText} color={theme.primary} bold variant="body">
                                {t('writeReview') || "Write a Review"}
                            </TextComponent>
                        </TouchableOpacity>
                    )}

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

                    {visibleReviews.map((review, index) => (
                        <ReviewItem 
                            key={review.id} 
                            review={review} 
                            index={index}
                            currentUserId={currentUserId}
                            onEditReview={onEditReview}
                            onDeleteReview={onDeleteReview}
                            handleOpenLightbox={handleOpenLightbox}
                            renderStars={renderStars}
                        />
                    ))}


                    {/* Pagination Controls */}
                    {reviews.length > visibleCount && (
                        <TouchableOpacity onPress={handleShowMore} style={styles.showMoreButton}>
                            <TextComponent style={styles.showMoreText} color={theme.primary} bold variant="label">{t('showMore')}</TextComponent>
                            <Ionicons name="chevron-down" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    )}

                    {visibleCount > 5 && reviews.length > 5 && (
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
            )
            }

            <ImageLightbox
                visible={lightboxVisible}
                images={lightboxImages}
                initialIndex={lightboxIndex}
                onClose={() => setLightboxVisible(false)}
            />
        </View >
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
    name: {
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
    },
    writeReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 8,
        gap: 8,
    },
    writeReviewText: {
        fontSize: 15,
    },
    authorActions: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        gap: 8,
    },
    actionIcon: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    translateToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
});
