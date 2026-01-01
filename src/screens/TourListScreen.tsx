import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { EmptyState } from '../components/common/EmptyState';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import TourCard from '../components/exploreScreen/TourCard';
import TourSkeleton from '../components/exploreScreen/TourSkeleton';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useUserContext } from '../context/UserContext';
import { userService } from '../services/userService';

type ListType = 'done' | 'created';

export default function TourListScreen() {
    const { theme } = useTheme();
    const router = useRouter();
    const { t } = useLanguage();
    const { type, title } = useLocalSearchParams<{ type: ListType, title: string }>();
    const { user } = useUserContext();

    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTours();
    }, [type]);

    const loadTours = async () => {
        setLoading(true);
        try {
            // In a real app, you might fetch specific lists from an API
            // For now, we'll assume we checking the current user's lists from context or service
            if (user) {
                // Reload user profile to get latest lists if needed, or just use what we have
                const profile = await userService.getUserProfile(user.id);
                if (type === 'done') {
                    setTours(profile.playedTours || []);
                } else if (type === 'created') {
                    setTours(profile.createdTours || []);
                }
            }
        } catch (error) {
            console.error('Error loading tours', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper style={{ backgroundColor: theme.bgPrimary }} includeTop={false} animateEntry={false}>
            <ScreenHeader showBackButton title={title || (type === 'done' ? t('toursDone') : t('toursCreated'))} />

            <FlatList
                data={(!loading || tours.length > 0) ? tours : [1, 2, 3, 4] as any}
                renderItem={({ item }) => {
                    if (loading && tours.length === 0) {
                        return (
                            <View style={{ marginBottom: 16 }}>
                                <TourSkeleton />
                            </View>
                        );
                    }
                    return (
                        <View style={{ marginBottom: 16 }}>
                            <TourCard
                                title={item.title}
                                author={item.author?.name || 'Unknown'}
                                imageUrl={item.imageUrl}
                                distance={item.distance ? `${item.distance} km` : '0 km'}
                                duration={item.duration ? `${item.duration} min` : '0 min'}
                                stops={item.stops?.length || 0}
                                rating={item.rating || 0}
                                reviewCount={item.reviews?.length || 0}
                                points={item.points || 0}
                                modes={item.modes || []}
                                genre={item.genre}
                                tourType={item.type}
                                onPress={() => router.push(`/tour/${item.id}`)}
                            />
                        </View>
                    );
                }}
                keyExtractor={(item) => (typeof item === 'number' ? `skeleton-${item}` : item.id.toString())}
                contentContainerStyle={styles.listContent}
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
        </ScreenWrapper>
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
});
