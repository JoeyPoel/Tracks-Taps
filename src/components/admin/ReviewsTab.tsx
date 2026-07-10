import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextComponent } from '../common/TextComponent';
import { adminStyles as styles } from './adminStyles';
import { useLanguage } from '../../context/LanguageContext';

interface ReviewsTabProps {
    adminState: {
        theme: any;
        reviewSearchQuery: string;
        setReviewSearchQuery: (val: string) => void;
        fetchReviews: (txt: string) => Promise<void>;
        loadingReviews: boolean;
        reviewsList: any[];
        deletingReviewId: number | null;
        handleDeleteReview: (id: number) => Promise<void>;
    };
}

export function ReviewsTab({ adminState }: ReviewsTabProps) {
    const { t } = useLanguage();
    const {
        theme,
        reviewSearchQuery,
        setReviewSearchQuery,
        fetchReviews,
        loadingReviews,
        reviewsList,
        deletingReviewId,
        handleDeleteReview
    } = adminState;

    return (
        <View style={styles.sectionContainer}>
            <TextComponent variant="h3" bold color={theme.textPrimary} style={styles.sectionHeading}>
                {t('reviewModeration')}
            </TextComponent>

            {/* Search Bar */}
            <View style={[styles.searchBarContainer, { backgroundColor: theme.bgSecondary, borderColor: theme.borderPrimary }]}>
                <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                    style={[styles.searchBarInput, { color: theme.textPrimary }]}
                    placeholder={t('searchReviewsPlaceholder')}
                    placeholderTextColor={theme.textSecondary + '80'}
                    value={reviewSearchQuery}
                    onChangeText={(txt) => {
                        setReviewSearchQuery(txt);
                        fetchReviews(txt);
                    }}
                />
            </View>

            {loadingReviews ? (
                <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 24 }} />
            ) : reviewsList.length > 0 ? (
                reviewsList.map((rev) => (
                    <View key={rev.id} style={[styles.card, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}>
                        <View style={styles.reviewHeader}>
                            <View style={{ flex: 1 }}>
                                <TextComponent variant="caption" bold color={theme.primary}>
                                    {rev.tour.title}
                                </TextComponent>
                                <TextComponent variant="caption" color={theme.textSecondary}>
                                    By {rev.author.name} • {new Date(rev.createdAt).toLocaleDateString()}
                                </TextComponent>
                            </View>
                            <View style={styles.ratingStars}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Ionicons
                                        key={i}
                                        name={i < rev.rating ? "star" : "star-outline"}
                                        size={14}
                                        color={i < rev.rating ? "#FFC107" : theme.textTertiary}
                                    />
                                ))}
                            </View>
                        </View>
                        <TextComponent variant="body" color={theme.textPrimary} style={{ marginVertical: 10 }}>
                            "{rev.content}"
                        </TextComponent>
                        <View style={[styles.userCardActions, { borderTopWidth: 1, borderTopColor: theme.borderPrimary, justifyContent: 'flex-start' }]}>
                            <TouchableOpacity
                                style={[styles.userActionBtn, { backgroundColor: theme.danger + '10', borderColor: theme.danger, borderWidth: 1, maxWidth: 120 }]}
                                onPress={() => handleDeleteReview(rev.id)}
                                disabled={deletingReviewId !== null}
                            >
                                {deletingReviewId === rev.id ? (
                                    <ActivityIndicator size="small" color={theme.danger} />
                                ) : (
                                    <TextComponent variant="caption" bold color={theme.danger}>
                                        {t('deleteReview')}
                                    </TextComponent>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={styles.centerContainer}>
                    <TextComponent variant="body" color={theme.textSecondary}>{t('noReviewsFound')}</TextComponent>
                </View>
            )}
        </View>
    );
}
