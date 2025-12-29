import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Dimensions, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { ScreenWrapper } from '../components/common/ScreenWrapper';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSavedTrips } from '../hooks/useSavedTrips';
import { SavedTrip } from '../services/savedTripsService';

const { width } = Dimensions.get('window');

export default function SavedTripsScreen() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const router = useRouter();
    const { lists, loading, loadLists } = useSavedTrips();

    useFocusEffect(
        useCallback(() => {
            loadLists();
        }, [loadLists])
    );

    const renderItem = ({ item, index }: { item: SavedTrip; index: number }) => {
        // Get up to 3 thumbnails for a gallery collage effect
        const thumbnails = item.tours?.slice(0, 3).map(t => t.imageUrl) || [];
        const tourCount = item.tours?.length || 0;

        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: theme.bgSecondary }]}
                    onPress={() => router.push(`/profile/saved-trips/${item.id}` as any)}
                    activeOpacity={0.9}
                >
                    <View style={styles.imageContainer}>
                        {thumbnails.length > 0 ? (
                            thumbnails.length === 1 ? (
                                <Image source={{ uri: thumbnails[0] }} style={styles.singleImage} contentFit="cover" />
                            ) : (
                                <View style={styles.collage}>
                                    <Image source={{ uri: thumbnails[0] }} style={styles.collageMain} contentFit="cover" />
                                    <View style={styles.collageSide}>
                                        {thumbnails.slice(1).map((uri: string, i: number) => (
                                            <Image key={i} source={{ uri }} style={styles.collageSmall} contentFit="cover" />
                                        ))}
                                    </View>
                                </View>
                            )
                        ) : (
                            <View style={[styles.placeholder, { backgroundColor: theme.bgTertiary }]}>
                                <Ionicons name="map" size={32} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                            </View>
                        )}
                        <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <Text style={styles.badgeText}>{tourCount} {tourCount === 1 ? 'tour' : 'tours'}</Text>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.updated, { color: theme.textSecondary }]}>
                                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Just now'}
                            </Text>
                        </View>
                        <View style={[styles.actionIcon, { backgroundColor: theme.bgTertiary }]}>
                            <Ionicons name="arrow-forward" size={20} color={theme.primary} />
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <ScreenWrapper
            style={{ backgroundColor: theme.bgPrimary }}
            includeTop={true}
            includeBottom={false}
            withBottomTabs={true}
            animateEntry={false}
        >
            <ScreenHeader
                title={t('savedTrips')}
                subtitle="Your personal collections"
                showBackButton={true}
            />

            <FlatList
                data={lists}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={loadLists} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <Animated.View entering={ZoomIn.springify()} style={styles.emptyContainer}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: theme.bgSecondary }]}>
                                <Ionicons name="heart" size={48} color={theme.error} style={{ opacity: 0.8 }} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No saved trips yet</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Start exploring and save your favorite tours to create your first collection.
                            </Text>
                        </Animated.View>
                    ) : null
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
        gap: 20,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    imageContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    singleImage: {
        width: '100%',
        height: '100%',
    },
    collage: {
        flexDirection: 'row',
        width: '100%',
        height: '100%',
    },
    collageMain: {
        flex: 2,
        height: '100%',
    },
    collageSide: {
        flex: 1,
        height: '100%',
        marginLeft: 2,
    },
    collageSmall: {
        flex: 1,
        marginBottom: 2,
    },
    placeholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backdropFilter: 'blur(10px)', // For web
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    updated: {
        fontSize: 12,
        fontWeight: '500',
    },
    actionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',

    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    }
});
