import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={16}
                color={theme.starColor}
            />
        ));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Reviews</Text>
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={20} color={theme.starColor} />
                    <Text style={[styles.averageRating, { color: theme.textPrimary }]}>
                        {averageRating.toFixed(1)}
                    </Text>
                    <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
                        ({totalReviews} reviews)
                    </Text>
                </View>
            </View>

            {reviews.map((review) => (
                <View
                    key={review.id}
                    style={[styles.reviewCard, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}
                >
                    <View style={styles.reviewHeader}>
                        <Image source={{ uri: review.userAvatar }} style={styles.avatar} />
                        <View style={styles.userInfo}>
                            <Text style={[styles.userName, { color: theme.textPrimary }]}>
                                {review.userName}
                            </Text>
                            <Text style={[styles.date, { color: theme.textSecondary }]}>
                                {review.date}
                            </Text>
                        </View>
                        <View style={styles.stars}>{renderStars(review.rating)}</View>
                    </View>

                    <Text style={[styles.comment, { color: theme.textPrimary }]}>
                        {review.comment}
                    </Text>

                    {review.images && review.images.length > 0 && (
                        <View style={styles.imagesRow}>
                            {review.images.map((img, index) => (
                                <Image key={index} source={{ uri: img }} style={styles.reviewImage} />
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    averageRating: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 14,
        marginLeft: 4,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
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
        fontSize: 14,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    stars: {
        flexDirection: 'row',
    },
    comment: {
        fontSize: 14,
        lineHeight: 20,
    },
    imagesRow: {
        flexDirection: 'row',
        marginTop: 12,
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 8,
    },
});
