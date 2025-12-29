import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import TourCard from '../components/exploreScreen/TourCard';
import { useTheme } from '../context/ThemeContext';
import { SavedTrip, savedTripsService } from '../services/savedTripsService';

export default function SavedTripDetailScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const router = useRouter();
    const [list, setList] = useState<SavedTrip | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadList();
    }, [id]);

    const loadList = async () => {
        try {
            setLoading(true);
            const data = await savedTripsService.getById(Number(id));
            setList(data);
        } catch (error) {
            console.error('Failed to load saved trip', error);
            Alert.alert('Error', 'Could not load saved trip');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteList = async () => {
        Alert.alert(
            'Delete Collection',
            'Are you sure you want to delete this collection? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await savedTripsService.delete(Number(id));
                            router.back();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete list');
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveTour = async (tourId: number) => {
        try {
            await savedTripsService.removeTour(Number(id), tourId);
            loadList();
        } catch (error) {
            Alert.alert('Error', 'Failed to remove tour');
        }
    }

    return (
        <ScreenWrapper
            style={{ backgroundColor: theme.bgPrimary }}
            includeTop={false}
            includeBottom={false}
            animateEntry={false}
            withBottomTabs={true}
        >
            {/* Custom Header */}
            <View style={[styles.header, { backgroundColor: theme.bgPrimary, borderBottomColor: theme.bgSecondary }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.iconButton, { backgroundColor: theme.bgSecondary }]}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleDeleteList}
                        style={[styles.iconButton, { backgroundColor: theme.error + '20' }]} // Subtle error background
                    >
                        <Ionicons name="trash-outline" size={22} color={theme.error} />
                    </TouchableOpacity>
                </View>
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>{list?.name || 'Loading...'}</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        {list?.tours?.length || 0} {(list?.tours?.length === 1) ? 'tour' : 'tours'} collected
                    </Text>
                </Animated.View>
            </View>

            <FlatList
                data={list?.tours || []}
                renderItem={({ item, index }) => {
                    const rating = item.reviews && item.reviews.length > 0
                        ? item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.reviews.length
                        : 0;
                    const reviewCount = item.reviews?.length || 0;

                    return (
                        <Animated.View
                            entering={FadeInDown.delay(index * 100).springify()}
                            style={styles.cardContainer}
                        >
                            <TourCard
                                title={item.title}
                                author={item.author?.name || 'Unknown'}
                                imageUrl={item.imageUrl}
                                distance={item.distance ? `${item.distance} km` : '0 km'}
                                duration={item.duration ? `${item.duration} min` : '0 min'}
                                stops={item.stops?.length || 0}
                                rating={rating}
                                reviewCount={reviewCount}
                                points={item.points || 0}
                                modes={item.modes || []}
                                genre={item.genre}
                                difficulty={item.difficulty as any}
                                onPress={() => router.push(`/tour/${item.id}`)}
                            />
                            <TouchableOpacity
                                style={[styles.removeButton, { backgroundColor: theme.bgPrimary, shadowColor: theme.shadowColor }]}
                                onPress={() => handleRemoveTour(item.id)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="close" size={18} color={theme.textPrimary} />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadList} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="map-outline" size={64} color={theme.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No tours in this collection yet.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomWidth: 1,
        gap: 16,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    listContent: {
        padding: 20,
        paddingBottom: 120,
        gap: 24,
    },
    cardContainer: {
        position: 'relative',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
