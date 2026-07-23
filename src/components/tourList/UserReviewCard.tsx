import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { TextComponent } from '../common/TextComponent';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface UserReviewCardProps {
    item: any;
    theme: any;
    t: (key: any) => string;
    router: any;
    effectiveUserId?: number | null;
    currentUserId?: number | null;
    onEdit: (review: any) => void;
    onDelete: (reviewId: number) => void;
}

export const UserReviewCard: React.FC<UserReviewCardProps> = ({
    item,
    theme,
    t,
    router,
    effectiveUserId,
    currentUserId,
    onEdit,
    onDelete
}) => {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Ionicons
                key={index}
                name={index < rating ? 'star' : 'star-outline'}
                size={14}
                color={index < rating ? "#FFD700" : theme.textSecondary + '40'}
            />
        ));
    };

    return (
        <View style={[styles.reviewItem, { backgroundColor: theme.bgSecondary }]}>
            <TouchableOpacity
                style={styles.reviewTourHeader}
                onPress={() => router.push(`/tour/${item.tour?.id}`)}
            >
                <Image
                    source={{ uri: getOptimizedImageUrl(item.tour?.imageUrl || '') }}
                    style={styles.tourThumbnail}
                    contentFit="cover"
                />
                <View style={styles.tourInfo}>
                    <TextComponent bold color={theme.textPrimary}>{item.tour?.title}</TextComponent>
                    <TextComponent variant="caption" color={theme.textSecondary}>{item.tour?.location}</TextComponent>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={styles.reviewContent}>
                <View style={styles.ratingRow}>
                    {renderStars(item.rating)}
                    <TextComponent variant="caption" color={theme.textSecondary} style={{ marginLeft: 8 }}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </TextComponent>
                </View>
                <TextComponent color={theme.textPrimary} style={styles.comment}>{item.content}</TextComponent>

                {item.photos && item.photos.length > 0 && (
                    <View style={styles.photosRow}>
                        {item.photos.map((photo: string, idx: number) => (
                            <Image
                                key={idx}
                                source={{ uri: getOptimizedImageUrl(photo || '') }}
                                style={styles.photoPreview}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Action buttons (only if it's the current user's profile) */}
            {effectiveUserId != null && currentUserId != null && String(effectiveUserId) === String(currentUserId) && (
                <View style={styles.reviewActions}>
                    <TouchableOpacity
                        onPress={() => onEdit({
                            id: item.id,
                            rating: item.rating,
                            content: item.content,
                            photos: item.photos,
                            tourName: item.tour?.title
                        })}
                        style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]}
                    >
                        <Ionicons name="pencil" size={16} color={theme.primary} />
                        <TextComponent variant="label" color={theme.primary} style={{ marginLeft: 4 }}>
                            {t('edit')}
                        </TextComponent>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => onDelete(item.id)}
                        style={[styles.actionButton, { backgroundColor: theme.danger + '15' }]}
                    >
                        <Ionicons name="trash-outline" size={16} color={theme.danger} />
                        <TextComponent variant="label" color={theme.danger} style={{ marginLeft: 4 }}>
                            {t('delete')}
                        </TextComponent>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    reviewItem: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
    },
    reviewTourHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        marginBottom: 12,
    },
    tourThumbnail: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    tourInfo: {
        flex: 1,
    },
    reviewContent: {
        marginBottom: 12,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    comment: {
        fontSize: 15,
        lineHeight: 20,
    },
    photosRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    photoPreview: {
        width: 60,
        height: 60,
        borderRadius: 8,
    },
    reviewActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
});
