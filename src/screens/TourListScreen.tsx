import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../components/common/EmptyState';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import TourCard from '../components/exploreScreen/TourCard';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { userService } from '../services/userService';
import { reviewService } from '../services/reviewService';
import { TextComponent } from '../components/common/TextComponent';
import ReviewForm from '../components/tourCompleted/ReviewForm';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { Image } from 'expo-image';
import { ToursDoneTabs } from '../components/profileScreen/ToursDoneTabs';
import { FadeInItem } from '../components/common/FadeInList';

type ListType = 'done' | 'created' | 'reviews';

export default function TourListScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const { type: initialType, title: initialTitle, targetUserId, initialTab } = useLocalSearchParams<{ type: ListType, title: string, targetUserId?: string, initialTab?: 'done' | 'reviews' }>();
    const { user } = useUserContext();

    const [activeTab, setActiveTab] = useState<'done' | 'reviews'>(initialTab || (initialType === 'reviews' ? 'reviews' : 'done'));
    
    // Effective type based on tabs (if initialType is done or review, we use Tab state. If created, we use created)
    const type = initialType === 'created' ? 'created' : activeTab;
    const title = initialType === 'created' ? (initialTitle || t('toursCreated')) : (t('toursDone') || 'Tours Done');

    const [tours, setTours] = useState<any[]>([]);
    const [editingReview, setEditingReview] = useState<any>(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    // If targetUserId is provided, use that, otherwise use logged in user's ID
    const effectiveUserId = targetUserId ? Number(targetUserId) : user?.id;

    const hasExpectedData = type === 'done'
        ? (user?.playedTours?.length || 0) > 0 || !!targetUserId
        : type === 'created'
            ? (user?.createdTours?.length || 0) > 0 || !!targetUserId
            : (user?.stats?.reviews || 0) > 0 || !!targetUserId;

    // Loading state: Only start with loading=true if we expect data to avoid flash of empty state
    const [loading, setLoading] = useState(hasExpectedData);

    useEffect(() => {
        loadTours();
    }, [type, targetUserId]);

    const loadTours = async () => {
        if (!effectiveUserId) return;
        setLoading(true);
        setTours([]); // Clear current items when loading new data to avoid stale rendering
        try {
            if (type === 'done') {
                const response: any = await userService.getUserPlayedTours(effectiveUserId);
                const data = (response.data && Array.isArray(response.data)) ? response.data : response;

                // data from API is UserPlayedTour[] with nested tour
                setTours(Array.isArray(data) ? data.map((pt: any) => ({
                    ...pt.tour,
                    uniqueKey: pt.id.toString() // UserPlayedTour ID
                })) : []);
            } else if (type === 'created') {
                const response: any = await userService.getUserCreatedTours(effectiveUserId);
                const data = (response.data && Array.isArray(response.data)) ? response.data : response;

                setTours(Array.isArray(data) ? data.map((t: any) => ({
                    ...t,
                    uniqueKey: t.id.toString()
                })) : []);
            } else if (type === 'reviews') {
                const response: any = await userService.getUserReviews(effectiveUserId);
                const data = (response.data && Array.isArray(response.data)) ? response.data : response;

                setTours(Array.isArray(data) ? data.map((r: any) => ({
                    ...r,
                    uniqueKey: r.id.toString()
                })) : []);
            }
        } catch (error) {
            console.error('Error loading tours', error);
        } finally {
            // Small delay to ensure state batching doesn't cause a layout "bump" before animations start
            setTimeout(() => setLoading(false), 100);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        Alert.alert(
            t('deleteReview') || 'Delete Review',
            t('confirmDeleteReview') || 'Are you sure you want to delete this review?',
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await reviewService.deleteReview(reviewId);
                            loadTours();
                            Alert.alert(t('success'), t('reviewDeleted') || 'Review deleted.');
                        } catch (error) {
                            console.error('Error deleting review:', error);
                            Alert.alert(t('error'), 'Failed to delete review');
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateReview = async (rating: number, content: string, photos: string[]) => {
        if (!editingReview) return;
        setSubmittingReview(true);
        try {
            await reviewService.updateReview(editingReview.id, { rating, content, photos });
            await loadTours(); // Wait for tours to fully reload with new data
            setEditingReview(null);
            Alert.alert(t('success'), t('reviewSubmitted') || 'Review submitted successfully!');
        } catch (error) {
            console.error('Error updating review:', error);
            Alert.alert(t('error'), 'Failed to update review');
        } finally {
            setSubmittingReview(false);
        }
    };

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
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <ScreenHeader showBackButton title={title} />

            {initialType !== 'created' && (
                <View style={{ paddingHorizontal: 20 }}>
                    <ToursDoneTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        doneCount={user?.stats?.toursDone || 0}
                        reviewsCount={user?.stats?.reviews || 0}
                    />
                </View>
            )}

            <FlatList
                data={tours}
                renderItem={({ item, index }) => {
                    if (type === 'reviews') {
                        return (
                            <FadeInItem index={index}>
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
                                    {effectiveUserId != null && user?.id != null && String(effectiveUserId) === String(user.id) && (
                                        <View style={styles.reviewActions}>
                                            <TouchableOpacity
                                                onPress={() => setEditingReview({
                                                    id: item.id,
                                                    rating: item.rating,
                                                    content: item.content,
                                                    photos: item.photos,
                                                    tourName: item.tour?.title
                                                })}
                                                style={[styles.actionButton, { backgroundColor: theme.primary + '15' }]}
                                            >
                                                <Ionicons name="pencil" size={16} color={theme.primary} />
                                                <TextComponent variant="label" color={theme.primary} style={{ marginLeft: 4 }}>{t('edit')}</TextComponent>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteReview(item.id)}
                                                style={[styles.actionButton, { backgroundColor: theme.danger + '15' }]}
                                            >
                                                <Ionicons name="trash-outline" size={16} color={theme.danger} />
                                                <TextComponent variant="label" color={theme.danger} style={{ marginLeft: 4 }}>{t('delete')}</TextComponent>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </FadeInItem>
                        );
                    }

                    return (
                        <FadeInItem index={index}>
                            <View style={{ marginBottom: 16 }}>
                                <TourCard
                                    title={item.title}
                                    author={item.author?.name || 'Unknown'}
                                    imageUrl={item.imageUrl}
                                    distance={item.distance ? `${item.distance} km` : '0 km'}
                                    duration={item.duration ? `${item.duration} min` : '0 min'}
                                    stops={item._count?.stops ?? item.stops?.length ?? 0}
                                    rating={item.rating || (item.reviews?.length > 0 ? (item.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / item.reviews.length) : 0)}
                                    reviewCount={item._count?.reviews ?? item.reviews?.length ?? 0}
                                    points={item.points || 0}
                                    location={item.location}
                                    modes={item.modes || []}
                                    genre={item.genre}
                                    tourType={item.type}
                                    onPress={() => router.push(`/tour/${item.id}`)}
                                    onEdit={type === 'created' ? () => router.push({ pathname: '/(tabs)/create', params: { tourId: item.id } }) : undefined}
                                />
                            </View>
                        </FadeInItem>
                    );
                }}
                keyExtractor={(item) => item.uniqueKey || (item.id ? item.id.toString() : Math.random().toString())}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={10}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadTours}
                        tintColor={theme.primary}
                    />
                }
                ListEmptyComponent={
                    (!loading && tours.length === 0) ? (
                        <EmptyState
                            icon="map-outline"
                            title={t('noToursFound')}
                            message={t('noToursFound')}
                        />
                    ) : null
                }
            />

            <ReviewForm
                visible={!!editingReview}
                onClose={() => setEditingReview(null)}
                onSubmit={handleUpdateReview}
                submitting={submittingReview}
                tourName={editingReview?.tourName || ''}
                mode="edit"
                initialData={editingReview}
            />
        </ScreenWrapper >
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 120,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
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
