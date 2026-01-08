import { TextComponent } from '@/src/components/common/TextComponent';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface LobbyTourInfoProps {
    activeTour: any;
}

export const LobbyTourInfo: React.FC<LobbyTourInfoProps> = ({ activeTour }) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const imageUrl = activeTour?.tour?.imageUrl;
    const optimizedUrl = getOptimizedImageUrl(imageUrl, 600);

    return (
        <Animated.View entering={FadeInUp.delay(100).springify()} style={[styles.tourCard, { backgroundColor: theme.bgSecondary }]}>
            {imageUrl ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: optimizedUrl }}
                        style={styles.tourImage}
                        contentFit="cover"
                        transition={200}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.imageOverlay}
                    />
                    <View style={styles.imageContent}>
                        <TextComponent style={styles.tourTitle} color="#FFF" bold variant="h3" numberOfLines={1}>
                            {activeTour?.tour?.title || t('loading')}
                        </TextComponent>
                        <TextComponent style={styles.tourSubtitle} color="#E0E0E0" variant="body">
                            {activeTour?.tour?._count?.stops || 0} {t('stops')} • {activeTour?.tour?.distance || 0} km
                        </TextComponent>
                    </View>
                </View>
            ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                    <LinearGradient
                        colors={[theme.primary + '40', theme.primary + '10']}
                        style={styles.tourIconBadge}
                    >
                        <Ionicons name="map" size={24} color={theme.primary} />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                        <TextComponent style={styles.tourTitle} color={theme.textPrimary} bold variant="h3" numberOfLines={1}>
                            {activeTour?.tour?.title || t('loading')}
                        </TextComponent>
                        <TextComponent style={styles.tourSubtitle} color={theme.textSecondary} variant="body">
                            {activeTour?.tour?._count?.stops || 0} {t('stops')} • {activeTour?.tour?.distance || 0} km
                        </TextComponent>
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    tourCard: {
        borderRadius: 20,
        marginBottom: 24,
        // Soft Styling
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        height: 200,
        width: '100%',
        justifyContent: 'flex-end',
    },
    tourImage: {
        ...StyleSheet.absoluteFillObject,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    imageContent: {
        padding: 16,
    },
    tourIconBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    tourTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    tourSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.7
    },
});
