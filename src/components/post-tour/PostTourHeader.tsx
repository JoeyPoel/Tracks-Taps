import { TextComponent } from '@/src/components/common/TextComponent';
import { useLanguage } from '@/src/context/LanguageContext';
import { useTheme } from '@/src/context/ThemeContext';
import { getOptimizedImageUrl } from '@/src/utils/imageUtils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PostTourHeaderProps {
    imageUrl?: string;
}

export default function PostTourHeader({ imageUrl }: PostTourHeaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            {imageUrl ? (
                <View style={styles.imageBackground}>
                    <Image
                        source={{ uri: getOptimizedImageUrl(imageUrl, 800) }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        cachePolicy="disk"
                        transition={300}
                    />
                    <LinearGradient
                        colors={['transparent', theme.bgPrimary]}
                        style={styles.gradientOverlay}
                        start={{ x: 0.5, y: 0.1 }}
                        end={{ x: 0.5, y: 1 }}
                    />
                    <View style={styles.content}>
                        <TextComponent
                            style={styles.headerTitle}
                            color={theme.textPrimary}
                            bold
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {t('greatJobTitle')}
                        </TextComponent>
                        <View style={[styles.subtitleBadge, { backgroundColor: theme.bgSecondary }]}>
                            <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                            <TextComponent style={styles.headerSubtitle} color={theme.textSecondary}>
                                {t('waitingForTeams')}
                            </TextComponent>
                        </View>
                    </View>
                </View>
            ) : (
                <LinearGradient
                    colors={[theme.secondary, theme.primary]}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.content}>
                        <TextComponent
                            style={styles.headerTitle}
                            color="#FFFFFF"
                            bold
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {t('greatJobTitle')}
                        </TextComponent>
                        <View style={[styles.subtitleBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                            <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                            <TextComponent style={styles.headerSubtitle} color="#FFFFFF">
                                {t('waitingForTeams')}
                            </TextComponent>
                        </View>
                    </View>
                </LinearGradient>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageBackground: {
        width: '100%',
        height: 340,
        justifyContent: 'flex-end',
    },
    headerGradient: {
        width: '100%',
        height: 260,
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '70%',
    },
    content: {
        alignItems: 'center',
        zIndex: 2,
        paddingHorizontal: 20,
        paddingBottom: 32,
        width: '100%',
        gap: 16,
    },
    headerTitle: {
        fontSize: 36,
        fontWeight: '900',
        lineHeight: 44, // Added to prevent cut-off
        paddingTop: 8,  // Added to give some space at top
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    subtitleBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    headerSubtitle: {
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
});
