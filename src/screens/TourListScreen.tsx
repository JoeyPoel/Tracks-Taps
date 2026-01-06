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

    // Improved Skeleton Logic: Only show skeleton if we expect data based on user context
    const hasExpectedData = type === 'done'
        ? (user?.playedTours?.length || 0) > 0
        : (user?.createdTours?.length || 0) > 0;

    // If we don't expect data, don't start with loading=true that triggers skeleton. 
    // We still fetch to be sure, but visually we start empty.
    const [loading, setLoading] = useState(hasExpectedData);

    useEffect(() => {
        loadTours();
    }, [type]);

    const loadTours = async () => {
        setLoading(true);
        try {
            // In a real app, you might fetch specific lists from an API
            // For now, we'll assume we checking the current user's lists from context or service
            if (user) {
                if (type === 'done') {
                    const playedTours = await userService.getUserPlayedTours(user.id);
                    // data from API is UserPlayedTour[] with nested tour
                    setTours(playedTours.map((pt: any) => ({
                        ...pt.tour,
                        uniqueKey: pt.id.toString() // UserPlayedTour ID
                    })) || []);
                } else if (type === 'created') {
                    const createdTours = await userService.getUserCreatedTours(user.id);
                    setTours(createdTours.map((t: any) => ({
                        ...t,
                        uniqueKey: t.id.toString()
                    })) || []);
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
                data={(loading && hasExpectedData && tours.length === 0) ? [1, 2, 3, 4] as any : tours}
                renderItem={({ item }) => {
                    if (typeof item === 'number') {
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
                                stops={item._count?.stops ?? item.stops?.length ?? 0}
                                rating={item.rating || 0}
                                reviewCount={item._count?.reviews ?? item.reviews?.length ?? 0}
                                points={item.points || 0}
                                modes={item.modes || []}
                                genre={item.genre}
                                tourType={item.type}
                                onPress={() => router.push(`/tour/${item.id}`)}
                            />
                        </View>
                    );
                }}
                keyExtractor={(item) => {
                    if (typeof item === 'number') return `skeleton-${item}`;
                    return item.uniqueKey || item.id.toString();
                }}
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
