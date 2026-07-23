import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { TextComponent } from '../common/TextComponent';
import { authEvents } from '../../utils/authEvents';

interface TourDetailHeroProps {
    tour: any;
    theme: any;
    t: (key: any) => string;
    user: any;
    isSaved: boolean;
    isFavourite: (tourId: number) => boolean;
    toggleFavourite: (tourId: number) => void;
    setShowSavedTripModal: (show: boolean) => void;
    router: any;
}

export const TourDetailHero: React.FC<TourDetailHeroProps> = ({
    tour,
    theme,
    t,
    user,
    isSaved,
    isFavourite,
    toggleFavourite,
    setShowSavedTripModal,
    router
}) => {
    return (
        <View style={styles.heroContainer}>
            <Image
                source={{ uri: tour.imageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                transition={500}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.05)', theme.bgPrimary]}
                locations={[0, 0.4, 1]}
                style={styles.heroGradient}
            />
            <Animated.View entering={FadeInUp.delay(200)} style={styles.heroContent}>
                <View style={[styles.tagContainer, { backgroundColor: theme.primary }]}>
                    <TextComponent style={styles.tagText} variant="caption" bold color={theme.textOnPrimary}>
                        {t(tour.genre?.toLowerCase() as any) || tour.genre}
                    </TextComponent>
                </View>
                <TextComponent style={styles.title} variant="h1" bold color={theme.fixedWhite}>
                    {tour.title}
                </TextComponent>
                <TouchableOpacity
                    style={styles.authorRow}
                    activeOpacity={0.7}
                    onPress={() => tour.author?.id && router.push({ pathname: '/(tabs)/profile/friend-profile', params: { userId: tour.author.id } })}
                >
                    <TextComponent style={{ marginRight: 4 }} color={theme.fixedWhite} variant="body">{t('by')}</TextComponent>
                    <TextComponent style={{ textDecorationLine: 'underline' }} color={theme.fixedWhite} variant="body" bold>
                        {tour.author?.name || t('unknown')}
                    </TextComponent>
                </TouchableOpacity>
            </Animated.View>

            {/* View on Map FAB */}
            <TouchableOpacity
                onPress={() => router.push({ pathname: '/(tabs)/map', params: { tourId: tour.id } })}
                style={[styles.mapFab, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
            >
                <Ionicons name="map" size={24} color={theme.textPrimary} />
                <TextComponent style={styles.mapFabText} variant="label" bold color={theme.textPrimary}>
                    {t('map')}
                </TextComponent>
            </TouchableOpacity>

            {/* Add to List Button */}
            <TouchableOpacity
                onPress={() => {
                    if (!user) {
                        authEvents.emit();
                        return;
                    }
                    setShowSavedTripModal(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                style={[styles.addToListFab, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
            >
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={isSaved ? "#FFD700" : theme.textPrimary} />
            </TouchableOpacity>

            {/* Saved Trip Button */}
            <TouchableOpacity
                onPress={() => {
                    if (!user) {
                        authEvents.emit();
                        return;
                    }
                    toggleFavourite(tour.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onLongPress={() => {
                    if (!user) {
                        authEvents.emit();
                        return;
                    }
                    setShowSavedTripModal(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
                style={[styles.savedTripFab, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
            >
                <Ionicons
                    name={isFavourite(tour.id) ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavourite(tour.id) ? theme.primary : theme.textPrimary}
                />
            </TouchableOpacity>

            {/* Edit Button (Only for Author) */}
            {user && tour.author?.id && String(user.id) === String(tour.author.id) && (
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(tabs)/create', params: { tourId: tour.id } })}
                    style={[styles.editFab, { backgroundColor: theme.bgSecondary, shadowColor: theme.shadowColor }]}
                >
                    <Ionicons name="pencil" size={24} color={theme.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    heroContainer: {
        height: 400,
        width: '100%',
        position: 'relative',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    heroContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    tagContainer: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        marginBottom: 12,
    },
    tagText: {
        textTransform: 'uppercase',
    },
    title: {
        marginBottom: 8,
        paddingRight: 100,
        fontSize: 28,
        fontWeight: 'bold',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapFab: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    mapFabText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    savedTripFab: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        zIndex: 20,
    },
    addToListFab: {
        position: 'absolute',
        top: 50,
        right: 76,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        zIndex: 20,
    },
    editFab: {
        position: 'absolute',
        top: 106,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
        zIndex: 20,
    }
});
