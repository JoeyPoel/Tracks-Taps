import { TextComponent } from '@/src/components/common/TextComponent';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import TourCard from '../components/exploreScreen/TourCard';
import { useTheme } from '../context/ThemeContext';
import { useSafeNavigation } from '../hooks/useSafeNavigation';
import { SavedTrip, savedTripsService } from '../services/savedTripsService';

export default function SavedTripDetailScreen() {
    const { id } = useLocalSearchParams();
    const { theme } = useTheme();
    const router = useRouter(); // Used for other navigations (push)
    const { goBack } = useSafeNavigation();
    const [list, setList] = useState<SavedTrip | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [localTours, setLocalTours] = useState<any[]>([]);

    useEffect(() => {
        if (id) loadList();
    }, [id]);

    useEffect(() => {
        if (list?.tours) {
            setLocalTours(list.tours);
        }
    }, [list]);

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

    const handleSaveOrder = async () => {
        try {
            const tourIds = localTours.map(t => t.id);
            await savedTripsService.updateOrder(Number(id), tourIds);
            setIsEditing(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to save order');
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
                            goBack();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete list');
                        }
                    }
                }
            ]
        );
    };

    const handleRemoveTour = async (tourId: number) => {
        Alert.alert(
            "Remove Tour",
            "Are you sure you want to remove this tour from the collection?",
            [
                { text: "Cancel", style: 'cancel' },
                {
                    text: "Remove",
                    style: 'destructive',
                    onPress: async () => {
                        // Optimistic update
                        setLocalTours(prev => prev.filter(t => t.id !== tourId));
                        try {
                            await savedTripsService.removeTour(Number(id), tourId);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove tour');
                            loadList(); // Revert
                        }
                    }
                }
            ]
        );
    }

    const renderItem = ({ item, getIndex, drag, isActive }: RenderItemParams<any>) => {
        const index = getIndex() || 0;
        const rating = item.reviews && item.reviews.length > 0
            ? item.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / item.reviews.length
            : 0;
        const reviewCount = item.reviews?.length || 0;

        return (
            <ScaleDecorator>
                <Animated.View
                    entering={FadeInDown.delay(index ? index * 100 : 0).springify()}
                    style={[
                        styles.cardContainer,
                        { opacity: isActive ? 0.8 : 1 }
                    ]}
                >
                    <View style={{ opacity: isEditing ? 0.9 : 1, pointerEvents: isEditing ? 'none' : 'auto' }}>
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
                            tourType={item.type}
                            onPress={() => !isEditing && router.push(`/tour/${item.id}`)}
                        />
                    </View>

                    {isEditing && (
                        <View style={styles.editOverlay}>
                            <View style={styles.reorderControls}>
                                <TouchableOpacity
                                    onLongPress={drag}
                                    style={[styles.controlBtn, { backgroundColor: theme.bgSecondary }]}
                                    delayLongPress={100}
                                >
                                    <Ionicons name="menu" size={24} color={theme.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.removeButton, { backgroundColor: theme.error }]}
                                onPress={() => handleRemoveTour(item.id)}
                            >
                                <Ionicons name="trash" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </ScaleDecorator>
        );
    };

    return (
        <ScreenWrapper
            style={{ backgroundColor: theme.bgPrimary }}
            includeTop={false}
            includeBottom={false}
            animateEntry={false}
            withBottomTabs={true}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ScreenHeader
                    title={list?.name || 'Loading...'}
                    subtitle={`${localTours.length} ${(localTours.length === 1) ? 'tour' : 'tours'} collected`}
                    showBackButton
                    rightElement={
                        <TouchableOpacity
                            onPress={() => isEditing ? handleSaveOrder() : setIsEditing(true)}
                            style={[styles.textButton, { backgroundColor: isEditing ? theme.primary : theme.bgTertiary }]}
                        >
                            <TextComponent style={styles.textButtonLabel} color={isEditing ? '#FFF' : theme.textPrimary} bold variant="body">
                                {isEditing ? 'Done' : 'Edit'}
                            </TextComponent>
                        </TouchableOpacity>
                    }
                />

                <DraggableFlatList
                    data={localTours}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    onDragEnd={({ data }) => setLocalTours(data)}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadList} tintColor={theme.primary} />
                    }
                    ListFooterComponent={
                        isEditing ? (
                            <View style={{ paddingBottom: 80 }}>
                                <TouchableOpacity
                                    style={[styles.deleteCollectionBtn, { borderColor: theme.error }]}
                                    onPress={handleDeleteList}
                                >
                                    <TextComponent style={{ fontWeight: '600' }} color={theme.error} bold variant="body">Delete Collection</TextComponent>
                                </TouchableOpacity>
                            </View>
                        ) : <View style={{ height: 80 }} />
                    }
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="map-outline" size={64} color={theme.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
                                <TextComponent style={styles.emptyText} color={theme.textSecondary} variant="body" center>
                                    No tours in this collection yet.
                                </TextComponent>
                            </View>
                        ) : null
                    }
                />
            </GestureHandlerRootView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    textButtonLabel: {
        fontWeight: '600',
        fontSize: 14,
    },
    listContent: {
        padding: 20,
        paddingBottom: 120,
    },
    cardContainer: {
        position: 'relative',
        marginBottom: 24, // moved gap here for draggable list consistency
    },
    editOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        pointerEvents: 'box-none',
        zIndex: 100, // Ensure overlay is above
    },
    reorderControls: {
        flexDirection: 'column',
        gap: 8,
        justifyContent: 'center',
    },
    controlBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    removeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    deleteCollectionBtn: {
        marginVertical: 20,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
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
