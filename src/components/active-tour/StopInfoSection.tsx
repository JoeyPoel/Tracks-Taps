import { StopType } from '@/src/types/models';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { getStopIcon } from '@/src/utils/stopIcons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TextComponent } from '../common/TextComponent'; // Added import

interface StopInfoSectionProps {
    stop: any;
}

export default function StopInfoSection({ stop }: StopInfoSectionProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    if (!stop) return null;

    const stopType = stop.type || StopType.Viewpoint;
    const { label, icon } = { label: stopType.replace('_', ' '), icon: getStopIcon(stopType, 16, theme.primary) };

    return (
        <View style={styles.container}>
            {stop.imageUrl ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: getOptimizedImageUrl(stop.imageUrl, 600) }}
                        contentFit="cover"
                        cachePolicy="disk"
                        transition={200}
                        style={[styles.image, { backgroundColor: theme.bgSecondary }]}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.imageOverlay}
                    />
                    <View style={styles.imageTypeBadge}>
                        <View style={[styles.iconBlur, { backgroundColor: theme.bgPrimary }]}>
                            {getStopIcon(stopType, 16, theme.primary)}
                            <TextComponent style={styles.typeText} color={theme.textPrimary} bold variant="caption">{label}</TextComponent>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={[styles.placeholderHeader, { backgroundColor: theme.bgSecondary }]}>
                    <View style={[styles.typeBadge, { backgroundColor: theme.bgPrimary, borderColor: theme.borderPrimary }]}>
                        {getStopIcon(stopType, 20, theme.primary)}
                        <TextComponent style={styles.typeText} color={theme.textPrimary} bold variant="caption">{label}</TextComponent>
                    </View>
                </View>
            )}

            <View style={[
                styles.contentCard,
                {
                    backgroundColor: theme.bgSecondary,
                    shadowColor: theme.shadowColor,
                }
            ]}>
                <View style={styles.headerRow}>
                    <TextComponent style={styles.title} color={theme.textPrimary} bold variant="h2">{stop.name}</TextComponent>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.borderSecondary }]} />

                <TextComponent style={styles.description} color={theme.textSecondary} variant="body">
                    {stop.detailedDescription || stop.description || t('noStopDescription')}
                </TextComponent>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        paddingTop: 12,
    },
    imageContainer: {
        width: '100%',
        height: 280,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    imageTypeBadge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
    },
    iconBlur: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        // Optional transparency if supported or solid
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    placeholderHeader: {
        width: '100%',
        paddingVertical: 32,
        borderRadius: 24,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        gap: 8,
    },
    typeText: {
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    contentCard: {
        borderRadius: 24,
        padding: 24,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4, // Android
        marginBottom: 24,
    },
    headerRow: {
        marginBottom: 16,
    },
    title: {
        letterSpacing: -0.5,
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 16,
    },
    description: {
        lineHeight: 26,
    },
});
