import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

import { MapIcon } from 'react-native-heroicons/solid'; // Add import
import { AnimatedPressable } from '../common/AnimatedPressable'; // Add import

import { getGenreIcon } from '../../utils/genres';

interface TourHeaderProps {
    title: string;
    author: string;
    imageUrl: string;
    genre?: string;
    onMapPress?: () => void;
}

export default function TourHeader({ title, author, imageUrl, genre, onMapPress }: TourHeaderProps) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const GenreIcon = genre ? getGenreIcon(genre) : null;

    return (
        <ImageBackground source={{ uri: imageUrl }} style={styles.background}>
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            >
                <View style={styles.contentContainer}>
                    <View style={styles.content}>
                        {genre && GenreIcon && (
                            <View style={[styles.genreBadge, { backgroundColor: theme.primary }]}>
                                <GenreIcon size={14} color="#FFF" />
                                <Text style={styles.genreText}>{genre}</Text>
                            </View>
                        )}
                        <Text style={[styles.title, { color: theme.fixedWhite }]}>{title}</Text>
                        <Text style={[styles.author, { color: theme.fixedWhite }]}>
                            {t('createdBy')} {author}
                        </Text>
                    </View>

                    {onMapPress && (
                        <AnimatedPressable
                            style={[styles.mapButton, { backgroundColor: theme.bgSecondary }]}
                            onPress={onMapPress}
                            haptic="medium"
                        >
                            <MapIcon size={20} color={theme.primary} />
                        </AnimatedPressable>
                    )}
                </View>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
    },
    gradient: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        padding: 24,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    content: {
        flex: 1,
        marginRight: 12,
    },
    mapButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    genreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginBottom: 8,
        gap: 6,
    },
    genreText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    author: {
        fontSize: 16,
        opacity: 0.9,
    },
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    backButton: {
        marginLeft: 24,
        marginTop: 8,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
});
